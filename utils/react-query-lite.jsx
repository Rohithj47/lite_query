import React from "react";

const QueryClientContext = React.createContext();

export const QueryClientProvider = ({ children, client }) => {
  return (
    <QueryClientContext.Provider value={client}>
      {children}
    </QueryClientContext.Provider>
  );
};

export const useQueryClient = () => {
  const client = React.useContext(QueryClientContext);
  if (!client) {
    throw new Error("useQueryClient must be used within a QueryClientProvider");
  }
  return client;
};

export class QueryClient {
  constructor() {
    this.queries = [];
    this.subscribers = [];
  }

  getQuery = (options) => {
    const queryHash = JSON.stringify(options.queryKey);
    let query = this.queries.find((q) => q.queryHash === queryHash);
    if (!query) {
      query = createQuery(this, options);
      this.queries.push(query);
    }

    return query;
  };
}

export const useQuery = ({ queryKey, queryFn, staleTime = 5 * 1000 * 60 }) => {
  const client = React.useContext(QueryClientContext);

  const [, rerender] = React.useReducer((i) => i + 1, 0);

  const observer = React.useRef();
  if (!observer.current) {
    observer.current = createQueryObserver(client, {
      queryKey,
      queryFn,
      staleTime,
    });
  }

  React.useEffect(() => {
    const unsubscribe = observer.current.subscribe(rerender);

    return () => {
      unsubscribe();
    };
  }, []);

  return observer.current.getResult();
};

const createQuery = (client, { queryKey, queryFn }) => {
  let query = {
    queryKey,
    queryHash: JSON.stringify(queryKey),
    promise: null,
    subscribers: [],
    state: {
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: true,
      isSuccess: false,
      error: undefined,
      lastFetched: null,
    },
    subscribe: (subscriber) => {
      query.subscribers.push(subscriber);
      return () => {
        query.subscribers = query.subscribers.filter((s) => s !== subscriber);
      };
    },
    setState: (updater) => {
      query.state = updater(query.state);
      query.subscribers.forEach((subscriber) => subscriber.notify());
    },
    fetch: async () => {
      if (!query.promise) {
        query.promise = (async () => {
          // update state to be fetching
          query.setState((prev) => ({
            ...prev,
            error: undefined,
            isFetching: true,
          }));

          try {
            const data = await queryFn();
            // update state to be success
            query.setState((prev) => ({
              ...prev,
              isSuccess: true,
              lastFetched: Date.now(),
              data,
            }));
          } catch (error) {
            // update state to be error
            query.setState((prev) => ({
              ...prev,
              isError: true,
              error,
            }));
          } finally {
            query.promise = null;
            // update state to be not fetching
            query.setState((prev) => ({
              ...prev,
              isLoading: false,
              isFetching: false,
            }));
          }
        })();
      }

      return query.promise;
    },
  };

  return query;
};

const createQueryObserver = (client, { queryKey, queryFn, staleTime }) => {
  const query = client.getQuery({ queryKey, queryFn });

  const observer = {
    notify: () => {},
    getResult: () => query.state,
    subscribe: (callback) => {
      observer.notify = callback;
      const unsubscribe = query.subscribe(observer);

      if (
        !query.state.lastFetched ||
        Date.now() - query.state.lastFetched > staleTime
      ) {
        query.fetch();
      }

      return unsubscribe;
    },
  };

  return observer;
};
