import React, { useContext, useReducer } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import App from "./pages/App";
import Splash from "./pages/Splash";
import ProtectedRoute from "./routes/ProtectedRoute";
import Context from "./context/context";
import reducer from "./reducers/reducer";

import "mapbox-gl/dist/mapbox-gl.css";
import * as serviceWorker from "./serviceWorker";

import { ApolloProvider } from "react-apollo";
import { ApolloClient } from "apollo-client";
import { WebSocketLink } from "apollo-link-ws";
import { InMemoryCache } from "apollo-cache-inmemory";

//@q allow us to send GraphQL queries && mutations over ws
const wsLink = new WebSocketLink({
  uri: "wss://pinit-butter.herokuapp.com/graphql",
  options: {
    reconnect: true,
  },
});

const client = new ApolloClient({
  link: wsLink,
  //@q normalized data store
  cache: new InMemoryCache(),
});

const Root = () => {
  //@q we create a variable initial state with our initial context
  const initialState = useContext(Context);
  //@q we get state && dispatch from our reducer hook
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <Router>
      {{
        /* wraps our React app and places the client on the context, which allows you to access it from anywhere in your component tree. */
      }}
      <ApolloProvider client={client}>
        {{
          /* wrap our React app with our Context provider that will give us access to state and dispatch in our component tree */
        }}
        <Context.Provider value={{ state, dispatch }}>
          <Switch>
            <ProtectedRoute exact path="/" component={App} />
            <Route path="/login" component={Splash} />
          </Switch>
        </Context.Provider>
      </ApolloProvider>
    </Router>
  );
};

ReactDOM.render(<Root />, document.getElementById("root"));

serviceWorker.register();
