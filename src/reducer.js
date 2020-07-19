export const initialState = {
  isDraggable: 'oklmpp',
  isDrag: false,
};
export const reducer = (state, action) => {
  switch (action.type) {
    case 'dragOn':
      return {...state, isDraggable: 'lolo'};
    case 'drag':
      return {...state, isDrag: !state.isDrag};
    case 'dragOff':
      return {...state, isDraggable: 'falopolse'};
    default:
      throw new Error('Unexpected action');
  }
};
