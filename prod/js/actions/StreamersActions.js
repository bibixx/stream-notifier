import dispatcher from "../dispatcher";

export function createQuote(obj) {
  dispatcher.dispatch({
    type: "CREATE_QUOTE",
    text: obj.text,
    teacher: obj.teacher,
    info: obj.info,
    name: obj.name,
  });
}

export function getAllStreams() {
  dispatcher.dispatch({
    type: "GET_STREAMS",
  });
}
