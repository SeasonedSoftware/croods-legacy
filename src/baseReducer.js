import initialState from './reducer/initialState'
import nestedReducer from './nestedReducer'
import { suffix } from './prefixedReducer'

const reducers = {
  SET_INFO: (state, action) => ({ ...state, info: action.info }),
  SET_LIST: (state, action) => ({ ...state, list: action.list }),
  RESET_CREATED: (state, action) => ({ ...state, created: null }),
  RESET_CREATE_ERROR: (state, action) => ({ ...state, createError: null }),
  RESET_UPDATED: (state, action) => ({ ...state, updated: null }),
  RESET_DESTROYED: (state, action) => ({ ...state, destroyed: null }),
}

export default (state = initialState, action = {}) => {
  const reducer = nestedReducer(reducers[suffix(action.type)])
  return reducer(state, action)
}
