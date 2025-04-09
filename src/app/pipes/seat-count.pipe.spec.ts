import { SeatCountPipe } from './seat-count.pipe';

describe('SeatCountPipe', () => {
  it('create an instance', () => {
    const pipe = new SeatCountPipe();
    expect(pipe).toBeTruthy();
  });
});
