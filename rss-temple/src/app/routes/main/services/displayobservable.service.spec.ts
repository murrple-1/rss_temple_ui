import {
  DisplayObservableService,
  DisplayType,
} from './displayobservable.service';

function setup() {
  const displayObservableService = new DisplayObservableService();

  return {
    displayObservableService,
  };
}

describe('displayobservable.service', () => {
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
