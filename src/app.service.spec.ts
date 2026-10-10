import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('returns the application greeting', () => {
    expect(service.getHello()).toBe('Hello World!');
  });
});