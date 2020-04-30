export default function reducer(state, action) {
  switch (action.type) {
    //@q Comp :: Login && Payload :: const { me } = await client.request(ME_QUERY);
    case "LOGIN_USER":
      return {
        ...state,
        currentUser: action.payload,
      };
    //@q Comp :: Login && Payload :: googleUser.isSignedIn() // https://www.npmjs.com/package/react-google-login
    case "IS_LOGGED_IN":
      return {
        ...state,
        isAuth: action.payload,
      };
    case "SIGNOUT_USER":
      return {
        ...state,
        isAuth: false,
        currentUser: null,
      };
    //@q Comp :: Map && Function :: HandleMapClick
    case "CREATE_DRAFT":
      return {
        ...state,
        currentPin: null,
        draft: {
          latitude: 0,
          longitude: 0,
        },
      };
    //@q Comp :: Map && Function :: HandleMapClick && Payload :: const [longitude, latitude] = lngLat :: const { lngLat } = event;
    case "UPDATE_DRAFT_LOCATION":
      return {
        ...state,
        draft: action.payload,
      };
    //@q Comp :: CreatePin && Function :: HandleDeleteDraft
    case "DELETE_DRAFT":
      return {
        ...state,
        draft: null,
      };
    //@q Comp :: Map && Function :: GetPins && Payload :: const { getPins } = await client.request(GET_PINS_QUERY);
    case "GET_PINS":
      return {
        ...state,
        pins: action.payload,
      };
    //@q Flow :: Comp :: CreatePin && Function :: HandleSubmit && Payload :: const variables = { title, image: url, content, latitude, longitude } :: await client.request(CREATE_PIN_MUTATION, variables);
    //@q Then :: Comp :: Map && Function :: Subscription(PIN_ADDED) && Payload :: const { pinAdded } = subscriptionData.data;
    case "CREATE_PIN":
      //@q get the new pin data from pinAdded
      const newPin = action.payload;
      //@q we make sure that our newPin isnt in our pins array
      const prevPins = state.pins.filter((pin) => pin._id !== newPin._id);
      return {
        ...state,
        pins: [...prevPins, newPin],
      };
    //@q Comp :: Map && Function :: HandleSelectPin
    case "SET_PIN":
      return {
        ...state,
        currentPin: action.payload,
        draft: null,
      };

    //@q Comp :: Map && Function :: Subscription(PIN_DELETED) && Payload ::  const { pinDeleted } = subscriptionData.data;
    case "DELETE_PIN":
      const deletedPin = action.payload;
      const filteredPins = state.pins.filter(
        (pin) => pin._id !== deletedPin._id
      );
      //@q we make sure to dont display a deleted pin , so if the pin deleted is in our state we set it to null
      if (state.currentPin) {
        const isCurrentPin = deletedPin._id === state.currentPin._id;
        if (isCurrentPin) {
          return {
            ...state,
            pins: filteredPins,
            currentPin: null,
          };
        }
      }
      return {
        ...state,
        pins: filteredPins,
      };
    //@q Comp :: Map && Function :: Subscription(CREATE_COMMENT) && Payload :: const { pinUpdated } = subscriptionData.data;
    case "CREATE_COMMENT":
      const updatedCurrentPin = action.payload;
      const updatedPins = state.pins.map((pin) =>
        pin._id === updatedCurrentPin._id ? updatedCurrentPin : pin
      );
      return {
        ...state,
        pins: updatedPins,
        currentPin: updatedCurrentPin,
      };
    default:
      return state;
  }
}
