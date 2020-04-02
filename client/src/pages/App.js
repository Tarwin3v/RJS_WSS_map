import React from "react";
import withRoot from "../HOC/withRoot";

import Header from "../components/Header";
import Map from "../components/Map";

const App = () => {
  return (
    <React.Fragment>
      <Header />
      <Map />
    </React.Fragment>
  );
};

export default withRoot(App);
