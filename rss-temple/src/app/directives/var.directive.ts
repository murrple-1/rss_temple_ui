import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

interface Context {
  $implicit?: unknown;
  appVar?: unknown;
}

@Directive({
  selector: '[appVar]',
})
export class VarDirective {
  private context: Context = {};

  @Input()
  set appVar(context: unknown) {
    this.context.$implicit = this.context.appVar = context;
    this.updateView();
  }

  constructor(
    private vcRef: ViewContainerRef,
    private templateRef: TemplateRef<unknown>,
  ) {}

  private updateView() {
    this.vcRef.clear();
    this.vcRef.createEmbeddedView(this.templateRef, this.context);
  }
}
