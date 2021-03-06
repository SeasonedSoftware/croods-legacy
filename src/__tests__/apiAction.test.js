import apiAction from '../apiAction'
import requestLogger from '../requestLogger'

jest.mock('../requestLogger', () => jest.fn())

const dispatch = jest.fn()
const afterFailure = jest.fn()
const afterSuccess = jest.fn()
const afterCreate = jest.fn()
const afterResponse = jest.fn()

afterEach(() => {
  jest.clearAllMocks()
})

describe('with default GET method and successful JSON response', () => {
  it('dispatches the correct actions', async () => {
    const response = {
      ok: true,
      text: () => JSON.stringify({ foo: 'bar' }),
      headers: {
        get: () => 'application/json',
      },
    }

    global.fetch = jest.fn(() => new Promise(resolve => resolve(response)))

    const action = apiAction({
      prefix: '@foo/BAR',
      path: '/foo/bar',
      parseResponse: json => ({ json }),
    })

    await action(dispatch)

    expect(dispatch).toHaveBeenCalledTimes(2)
    expect(dispatch).toHaveBeenCalledWith({ type: '@foo/BAR_REQUEST' })

    expect(dispatch).toHaveBeenCalledWith({
      json: { foo: 'bar' },
      type: '@foo/BAR_SUCCESS',
    })
  })
})

describe('with default GET method and successful text response', () => {
  it('dispatches the correct actions', async () => {
    const response = {
      ok: true,
      text: () => 'foo bar',
      headers: {
        get: () => 'text/html',
      },
    }

    global.fetch = jest.fn(() => new Promise(resolve => resolve(response)))

    const action = apiAction({
      prefix: '@foo/BAR',
      path: '//foo/bar',
      parseResponse: json => ({ json }),
    })

    await action(dispatch)

    expect(dispatch).toHaveBeenCalledTimes(2)
    expect(dispatch).toHaveBeenCalledWith({ type: '@foo/BAR_REQUEST' })

    expect(dispatch).toHaveBeenCalledWith({
      json: { id: 'undefined', message: 'foo bar' },
      type: '@foo/BAR_SUCCESS',
    })
  })
})

describe('with default GET method and failed JSON response', () => {
  it('dispatches the correct actions', async () => {
    const response = {
      ok: false,
      text: () => JSON.stringify({ foo: 'bar' }),
      headers: {
        get: () => 'application/json',
      },
    }

    global.fetch = jest.fn(() => new Promise(resolve => resolve(response)))

    const action = apiAction({
      prefix: '@foo/BAR',
      path: '//foo/bar',
      parseResponse: json => ({ json }),
    })

    await action(dispatch)

    expect(dispatch).toHaveBeenCalledTimes(2)
    expect(dispatch).toHaveBeenCalledWith({ type: '@foo/BAR_REQUEST' })

    expect(dispatch).toHaveBeenCalledWith({
      error: { id: 'unknownError', message: 'Ooops, there was an error.' },
      type: '@foo/BAR_FAILURE',
    })
  })
})

describe('with JSON response error', () => {
  it('dispatches the correct actions ', async () => {
    const response = {
      message: 'Failed to fetch',
      stack: 'TypeError: Failed to fetch',
    }

    global.fetch = jest.fn(() => new Promise(resolve => resolve(response)))

    const action = apiAction({
      prefix: '@foo/BAR',
      path: '//foo/bar',
      parseResponse: json => ({ json }),
    })

    await action(dispatch)

    expect(dispatch).toHaveBeenCalledTimes(2)
    expect(dispatch).toHaveBeenCalledWith({ type: '@foo/BAR_REQUEST' })

    expect(dispatch).toHaveBeenCalledWith({
      error: {
        id: 'unknownError',
        message: 'Network error, please check your connection.',
      },
      type: '@foo/BAR_FAILURE',
    })
  })
})

describe('with POST method and successful response', () => {
  it('dispatches the correct actions', async () => {
    const response = {
      ok: true,
      text: () => JSON.stringify({ foo: 'bar' }),
      headers: {
        get: () => 'application/json',
      },
    }

    global.fetch = jest.fn(() => new Promise(resolve => resolve(response)))

    const action = apiAction({
      prefix: '@foo/BAR',
      path: '//foo/bar',
      method: 'POST',
      params: { foo: 'bar' },
      parseResponse: json => ({ json }),
    })

    await action(dispatch)

    expect(dispatch).toHaveBeenCalledTimes(2)
    expect(dispatch).toHaveBeenCalledWith({ type: '@foo/BAR_REQUEST' })

    expect(dispatch).toHaveBeenCalledWith({
      json: { foo: 'bar' },
      type: '@foo/BAR_SUCCESS',
    })
  })
})

describe('with POST method and with newtwork error', () => {
  it('dispatches the correct actions', async () => {
    const response = {
      ok: false,
      text: () => JSON.stringify({ foo: 'bar' }),
      headers: {
        get: () => 'application/json',
      },
    }

    global.fetch = jest.fn(
      () => new Promise((resolve, reject) => reject(response)),
    )

    const action = apiAction({
      prefix: '@foo/BAR',
      path: '//foo/bar',
      method: 'POST',
      params: { foo: 'bar' },
      processResponse: (response, json) => ({ response, json }),
    })

    await action(dispatch)

    expect(dispatch).toHaveBeenCalledTimes(2)
    expect(dispatch).toHaveBeenCalledWith({ type: '@foo/BAR_REQUEST' })

    expect(dispatch).toHaveBeenCalledWith({
      error: { id: 'unknownError', message: 'Ooops, there was an error.' },
      type: '@foo/BAR_FAILURE',
    })
  })
})

describe('with custom headers', () => {
  describe('whith an object', () => {
    it('merges custom and default headers', async () => {
      const response = {
        ok: true,
        text: () => JSON.stringify({ foo: 'bar' }),
        headers: {
          get: () => 'application/json',
        },
      }

      global.fetch = jest.fn(() => new Promise(resolve => resolve(response)))

      const action = apiAction({
        prefix: '@foo/BAR',
        baseUrl: 'http://foourl/',
        path: '//foo/bar',
        method: 'POST',
        headers: { bar: 'foo' },
        parseResponse: json => ({ json }),
      })

      await action(dispatch)

      expect(global.fetch).toHaveBeenCalledWith('http://foourl/foo/bar', {
        credentials: undefined,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          bar: 'foo',
        },
        method: 'POST',
      })
    })

    it('overwrites default headers with custom ones', async () => {
      const response = {
        ok: true,
        text: () => JSON.stringify({ foo: 'bar' }),
        headers: {
          get: () => 'application/json',
        },
      }

      global.fetch = jest.fn(() => new Promise(resolve => resolve(response)))

      const action = apiAction({
        prefix: '@foo/BAR',
        baseUrl: 'http://foourl/',
        path: '//foo/bar',
        method: 'POST',
        headers: { Accept: 'foo' },
        parseResponse: json => ({ json }),
      })

      await action(dispatch)

      expect(global.fetch).toHaveBeenCalledWith('http://foourl/foo/bar', {
        credentials: undefined,
        headers: {
          Accept: 'foo',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
    })
  })

  describe('whith a function', () => {
    it('calls the function with default headers as parameters', async () => {
      const headers = jest.fn(props => ({ ...props, foo: 'bar' }))
      const response = {
        ok: true,
        text: () => JSON.stringify({ foo: 'bar' }),
        headers: {
          get: () => 'application/json',
        },
      }

      global.fetch = jest.fn(() => new Promise(resolve => resolve(response)))

      const action = apiAction({
        prefix: '@foo/BAR',
        baseUrl: 'foourl/',
        path: '/foo/bar',
        method: 'POST',
        headers,
        parseResponse: json => ({ json }),
      })

      await action(dispatch)

      expect(headers).toHaveBeenCalledWith({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      })

      expect(global.fetch).toHaveBeenCalledWith('foourl/foo/bar', {
        credentials: undefined,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          foo: 'bar',
        },
        method: 'POST',
      })
    })
  })
})

describe('with debugRequests', () => {
  it('uses requestLogger function to log fetch params', async () => {
    const action = apiAction({
      prefix: '@foo/BAR',
      path: '//foo/bar',
      baseUrl: 'http://foo.com',
      parseResponse: json => ({ json }),
      debugRequests: true,
    })

    await action(dispatch)

    expect(requestLogger).toHaveBeenCalled()
    expect(requestLogger).toHaveBeenCalledWith('http://foo.com/foo/bar', {
      credentials: undefined,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'get',
    })
  })
})

describe('with afterFailure', () => {
  const action = apiAction({
    prefix: '@foo/BAR',
    baseUrl: 'https://foourl',
    path: '/foo/bar',
    method: 'POST',
    headers: { bar: 'foo' },
    afterFailure,
    parseResponse: json => ({ json }),
  })

  describe('when response is ok', () => {
    it('does NOT call afterFailure function', async () => {
      const response = {
        ok: true,
        text: () => JSON.stringify({ foo: 'bar' }),
        headers: {
          get: () => 'application/json',
        },
      }
      global.fetch = jest.fn(() => new Promise(resolve => resolve(response)))
      await action(dispatch)
      expect(afterFailure).not.toBeCalled()
    })
  })

  describe('when response is NOT ok', () => {
    it('calls afterFailure function', async () => {
      const response = {
        ok: false,
        text: () => JSON.stringify({ foo: 'bar' }),
        headers: {
          get: () => 'application/json',
        },
      }
      global.fetch = jest.fn(() => new Promise(resolve => resolve(response)))
      await action(dispatch)
      expect(afterFailure).toBeCalled()
    })
  })
})

describe('with afterSuccess', () => {
  const action = apiAction({
    prefix: '@foo/BAR',
    baseUrl: 'foourl/',
    path: '//foo/bar',
    method: 'POST',
    headers: { bar: 'foo' },
    afterSuccess,
    parseResponse: json => ({ json }),
  })

  describe('when response is ok', () => {
    it('calls afterSuccess function', async () => {
      const response = {
        ok: true,
        text: () => JSON.stringify({ foo: 'bar' }),
        headers: {
          get: () => 'application/json',
        },
      }
      global.fetch = jest.fn(() => new Promise(resolve => resolve(response)))
      await action(dispatch)
      expect(afterSuccess).toBeCalled()
    })
  })

  describe('when response is NOT ok', () => {
    it('does NOT call afterSuccess function', async () => {
      const response = {
        ok: false,
        text: () => JSON.stringify({ foo: 'bar' }),
        headers: {
          get: () => 'application/json',
        },
      }
      global.fetch = jest.fn(() => new Promise(resolve => resolve(response)))
      await action(dispatch)
      expect(afterSuccess).not.toBeCalled()
    })
  })
})

describe('with afterCreate', () => {
  const options = {
    prefix: '@foo/CREATE',
    baseUrl: 'foourl',
    path: '//foo/bar',
    method: 'POST',
    headers: { bar: 'foo' },
    afterCreate,
    parseResponse: json => ({ json }),
  }
  const action = apiAction(options)

  describe('if request was of Create type and it succeeded', () => {
    it('calls afterCreate function', async () => {
      const response = {
        ok: true,
        text: () => JSON.stringify({ foo: 'bar' }),
        headers: {
          get: () => 'application/json',
        },
      }
      global.fetch = jest.fn(() => new Promise(resolve => resolve(response)))
      await action(dispatch)
      expect(afterCreate).toBeCalled()
    })
  })

  describe('if request was not of Create type', () => {
    it('calls afterCreate function', async () => {
      const response = {
        ok: true,
        text: () => JSON.stringify({ foo: 'bar' }),
        headers: {
          get: () => 'application/json',
        },
      }
      global.fetch = jest.fn(() => new Promise(resolve => resolve(response)))
      await apiAction({ ...options, prefix: '@foo/BAR' })(dispatch)
      expect(afterCreate).not.toBeCalled()
    })
  })
})

describe('with afterResponse', () => {
  const action = apiAction({
    prefix: '@foo/BAR',
    baseUrl: 'foourl',
    path: '//foo/bar',
    method: 'POST',
    headers: { bar: 'foo' },
    afterResponse,
    parseResponse: json => ({ json }),
  })

  describe('when response is ok', () => {
    it('calls afterResponse function', async () => {
      const response = {
        ok: true,
        text: () => JSON.stringify({ foo: 'bar' }),
        headers: {
          get: () => 'application/json',
        },
      }
      global.fetch = jest.fn(() => new Promise(resolve => resolve(response)))
      await action(dispatch)
      expect(afterResponse).toBeCalled()
    })
  })

  describe('when response is NOT ok', () => {
    it('calls afterResponse function', async () => {
      const response = {
        ok: false,
        text: () => JSON.stringify({ foo: 'bar' }),
        headers: {
          get: () => 'application/json',
        },
      }
      global.fetch = jest.fn(() => new Promise(resolve => resolve(response)))
      await action(dispatch)
      expect(afterResponse).toBeCalled()
    })
  })
})
