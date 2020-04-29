import React, { useContext } from "react";
import Context from "../context/context";

//MUI
import { unstable_useMediaQuery as useMediayQuery } from "@material-ui/core/useMediaQuery";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import MapIcon from "@material-ui/icons/Map";
import Typography from "@material-ui/core/Typography";

//COMP
import Signout from "../components/Auth/Signout";

const Header = ({ classes }) => {
  const mobileSize = useMediayQuery("(max-width:650px)");
  const { state } = useContext(Context);
  const { currentUser } = state;

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          {/*Title /Logo */}
          <div className={classes.grow}>
            <MapIcon className={classes.icon} />
            <Typography
              className={mobileSize ? classes.mobile : ""}
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
            >
              PinPin
            </Typography>
          </div>
          {/* current User Info */}
          {currentUser && (
            <div className={classes.Rgrow}>
              <img
                className={classes.picture}
                src={currentUser.picture}
                alt={currentUser.name}
              />
              <Typography
                className={mobileSize ? classes.mobile : ""}
                variant="h5"
                color="inherit"
                noWrap
              >
                {currentUser.name.split(" ")[0]}
              </Typography>
            </div>
          )}
          {/* Signout Button */}
          <Signout />
        </Toolbar>
      </AppBar>
    </div>
  );
};

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
  },
  Rgrow: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    marginRight: theme.spacing.unit,
    color: "white",
    fontSize: 45,
  },
  mobile: {
    display: "none",
  },
  picture: {
    height: "50px",
    borderRadius: "50%",
    marginRight: theme.spacing.unit * 2,
  },
});

export default withStyles(styles)(Header);
