import {
  DisplayObservableService,
  DisplayType,
} from './display-observable.service';

function setup() {
  const displayObservableService = new DisplayObservableService();

  return {
    displayObservableService,
  };
}

describe('DisplayObservableService', () => {
  it('should set display', () => {
    const { displayObservableService } = setup();

    displayObservableService.display.next(DisplayType.Comfy);
    expect(displayObservableService.display.getValue()).toBe(DisplayType.Comfy);

    displayObservableService.display.next(DisplayType.Compact);
    expect(displayObservableService.display.getValue()).toBe(
      DisplayType.Compact,
    );
  });
});
