import { fireEvent } from '@testing-library/dom';

import { createApp } from '../src';

describe('createApp', () => {
  const domain = 'test-domain';
  const app = createApp(domain);

  it('correctly sets the domain', () => {
    expect(app.getState().domain).toEqual(domain);
  });

  it('authenticates', () => {
    expect(app.getState().ready).toBe(false);

    const token = 'test-token';
    fireEvent(
      window,
      new MessageEvent('message', {
        data: { type: 'handshake', payload: { token } },
      })
    );

    expect(app.getState().ready).toBe(true);
    expect(app.getState().token).toEqual(token);
  });

  it('subscribes to an event and returns unsubcribe function', () => {
    // subscribe
    const callback = jest.fn();
    const unsubscribe = app.subscribe('handshake', callback);

    expect(callback).not.toHaveBeenCalled();

    const token = 'fresh-token';
    fireEvent(
      window,
      new MessageEvent('message', {
        data: { type: 'handshake', payload: { token } },
      })
    );

    expect(callback).toHaveBeenCalledTimes(1);
    expect(app.getState().token).toEqual(token);

    // unsubscribe
    unsubscribe();

    fireEvent(
      window,
      new MessageEvent('message', {
        data: { type: 'handshake', payload: { token: '123' } },
      })
    );

    expect(callback).toHaveBeenCalledTimes(1);
    expect(app.getState().token).toEqual('123');
  });
});
