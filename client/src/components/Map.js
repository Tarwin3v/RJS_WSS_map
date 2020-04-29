import React, { useState, useEffect, useContext } from "react";
import differenceInMinutes from "date-fns/difference_in_minutes";
import ReactMapGL, { NavigationControl, Marker, Popup } from "react-map-gl";

//MUI
import { unstable_useMediaQuery as useMediayQuery } from "@material-ui/core/useMediaQuery";
import { withStyles } from "@material-ui/core/styles";
import { Typography, Button } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/DeleteTwoTone";

//COMP
import PinIcon from "./PinIcon";
import Blog from "./Blog";

//DATA
import Context from "../context/context";
import { Subscription } from "react-apollo";
import { useClient } from "../hooks/client";
import { GET_PINS_QUERY } from "../graphql/queries";
import { DELETE_PIN_MUTATION } from "../graphql/mutations";
import {
  PIN_ADDED_SUBSCRIPTION,
  PIN_UPDATED_SUBSCRIPTION,
  PIN_DELETED_SUBSCRIPTION,
} from "../graphql/subscriptions";

const INITIAL_VIEWPORT = {
  latitude: 48.849479656086515,
  longitude: 2.3323768214423035,
  zoom: 13,
};

const Map = ({ classes }) => {
  const mobileSize = useMediayQuery("(max-width:650px)");
  const client = useClient();
  const { state, dispatch } = useContext(Context);

  useEffect(() => {
    getPins();
  }, []);

  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    getUserPosition();
  }, []);

  const [popup, setPopup] = useState(null);

  useEffect(
    () => {
      const pinExists =
        popup && state.pins.findIndex((pin) => pin._id === popup._id) > -1;
      if (!pinExists) {
        setPopup(null);
      }
    },
    [state.pins.length]
  );

  const getUserPosition = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setViewport({ ...viewport, latitude, longitude });
        setUserPosition({ latitude, longitude });
      });
    }
  };

  const getPins = async () => {
    const { getPins } = await client.request(GET_PINS_QUERY);
    dispatch({ type: "GET_PINS", payload: getPins });
  };

  const handleMapClick = (event) => {
    const { lngLat, leftButton } = event;
    if (!leftButton) return;
    if (!state.draft) {
      dispatch({ type: "CREATE_DRAFT" });
    }
    const [longitude, latitude] = lngLat;
    dispatch({
      type: "UPDATE_DRAFT_LOCATION",
      payload: { latitude, longitude },
    });
  };

  const highlightNewPin = (pin) => {
    const isNewPin =
      differenceInMinutes(Date.now(), Number(pin.createdAt)) <= 30;
    return isNewPin ? "limegreen" : "darkblue";
  };

  const handleSelectPin = (pin) => {
    setPopup(pin);
    dispatch({ type: "SET_PIN", payload: pin });
  };

  const isAuthUser = () => state.currentUser._id === popup.author._id;

  const handleDeletePin = async (pin) => {
    await client.request(DELETE_PIN_MUTATION, {
      pinId: pin._id,
    });
    setPopup(null);
  };

  return (
    <div className={mobileSize ? classes.rootMobile : classes.root}>
      <ReactMapGL
        width="100vw"
        height="calc(100vh - 64px)"
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxApiAccessToken="pk.eyJ1IjoidGFyd2luM3YiLCJhIjoiY2s1emZzZHVvMGtqMDNqcDN3cHB0dmd5eSJ9.4orl8QiDwgisDQsJuPwSpw"
        onViewportChange={(newViewport) => setViewport(newViewport)}
        {...viewport}
        onClick={handleMapClick}
        scrollZoom={!mobileSize}
      >
        {/* Navigation Control */}
        <div className={classes.navigationControl}>
          <NavigationControl
            onViewportChange={(newViewport) => setViewport(newViewport)}
          />
        </div>
        {/* Pin for User's position */}
        {userPosition && (
          <Marker
            latitude={userPosition.latitude}
            longitude={userPosition.longitude}
            offsetLeft={-19}
            offsetTop={-37}
          >
            <PinIcon size={40} color="red" />
          </Marker>
        )}
        {/* Draft Pin */}
        {state.draft && (
          <Marker
            latitude={state.draft.latitude}
            longitude={state.draft.longitude}
            offsetLeft={-19}
            offsetTop={-37}
          >
            <PinIcon size={40} color="orange" />
          </Marker>
        )}
        {/* Persisted Pins */}
        {state.pins.map((pin) => (
          <Marker
            key={pin._id}
            latitude={pin.latitude}
            longitude={pin.longitude}
            offsetLeft={-19}
            offsetTop={-37}
          >
            <PinIcon
              onClick={() => handleSelectPin(pin)}
              size={40}
              color={highlightNewPin(pin)}
            />
          </Marker>
        ))}
        {/* Popup for created pins */}
        {popup && (
          <Popup
            anchor="top"
            latitude={popup.latitude}
            longitude={popup.longitude}
            closeOnClick={false}
            onClose={() => setPopup(null)}
          >
            <img
              className={classes.popupImage}
              src={popup.image}
              alt={popup.title}
            />
            <div className={classes.popupTab}>
              <Typography>
                {popup.latitude.toFixed(4)}, {popup.longitude.toFixed(4)}
              </Typography>
              {isAuthUser() && (
                <Button onClick={() => handleDeletePin(popup)}>
                  Delete Pin
                  <DeleteIcon className={classes.deleteIcon} />
                </Button>
              )}
            </div>
          </Popup>
        )}
      </ReactMapGL>
      {/* Subscriptions for creating/updating/deleting pins */}
      <Subscription
        subscription={PIN_ADDED_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => {
          const { pinAdded } = subscriptionData.data;
          console.log(pinAdded);
          dispatch({ type: "CREATE_PIN", payload: pinAdded });
        }}
      />
      <Subscription
        subscription={PIN_UPDATED_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => {
          const { pinUpdated } = subscriptionData.data;
          console.log(pinUpdated);
          dispatch({ type: "CREATE_COMMENT", payload: pinUpdated });
        }}
      />
      <Subscription
        subscription={PIN_DELETED_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => {
          const { pinDeleted } = subscriptionData.data;
          console.log(pinDeleted);
          dispatch({ type: "DELETE_PIN", payload: pinDeleted });
        }}
      />
      {/* Blog for pin content */}
      <Blog />
    </div>
  );
};

const styles = {
  root: {
    display: "flex",
  },
  rootMobile: {
    display: "flex",
    flexDirection: "column-reverse",
  },
  navigationControl: {
    position: "absolute",
    top: 0,
    right: 0,
    margin: "1em",
  },
  deleteIcon: {
    color: "red",
  },
  popupImage: {
    padding: "0.4em",
    height: 200,
    width: 200,
    objectFit: "cover",
  },
  popupTab: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
};

export default withStyles(styles)(Map);
