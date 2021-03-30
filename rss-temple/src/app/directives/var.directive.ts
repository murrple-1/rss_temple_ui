import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

interface Context<T> {
  $implicit?: T;
  appVar?: T;
}

@Directive({
  selector: '[appVar]',
})
export class VarDirective<T> {
  private context: Context<T> = {};

  @Input()
  set appVar(context: T) {
    this.context.$implicit = this.context.appVar = context;
    this.updateView();
  }

  constructor(
    private vcRef: ViewContainerRef,
    private templateRef: TemplateRef<T>,
  ) {}

  private updateView() {
    this.vcRef.clear();
    this.vcRef.createEmbeddedView<Context<T>>(this.templateRef, this.context);
  }
}
