import { useState, useEffect } from "react";
import { GraphQLClient } from "graphql-request";

export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://pinit-butter.herokuapp.com/graphql"
    : "http://localhost:4000/graphql";

//@q we get our token from google api and we persist it in idToken state before to send with with our GraphQLClient to our graphql backend in a header
export const useClient = () => {
  const [idToken, setIdToken] = useState("");

  useEffect(() => {
    const token = window.gapi.auth2
      .getAuthInstance()
      .currentUser.get()
      .getAuthResponse().id_token;
    setIdToken(token);
  }, []);

  return new GraphQLClient(BASE_URL, {
    headers: { authorization: idToken },
  });
};
