import { NgbModalRef as NgbModalRef_ } from '@ng-bootstrap/ng-bootstrap';

export type NgbModalRef<ResultType, ComponentType> = Omit<
  NgbModalRef_,
  'result' | 'componentInstance'
> & {
  result: Promise<ResultType>;
  componentInstance: ComponentType;
};
