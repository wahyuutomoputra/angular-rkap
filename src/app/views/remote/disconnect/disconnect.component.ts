import {
  Component,
  Input,
  ViewChild,
  EventEmitter,
  Output,
  AfterViewInit,
  ElementRef
} from '@angular/core';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  error
} from 'selenium-webdriver';
import 'rxjs/add/operator/toPromise';
import notify from 'devextreme/ui/notify';

import {
 AppConstant
} from './../../../app.constant';

import DataSource from 'devextreme/data/data_source';
import {
  DxDataGridComponent,
  DxDataGridModule,
  DxSelectBoxModule,
  DxFormModule,
  DxSelectBoxComponent,
  DxButtonComponent,
  DxFileUploaderModule,
  DxValidatorModule
} from 'devextreme-angular';

import {
  RemoteService
} from './../remote.service';
import {
  SiteService
} from './../../master/site/site.service';
import {
  Disconnect,
} from './../remote.model';
import {
  SiteSearchService
} from '../../shared/_siteSearch.service';
import {
  Observable
} from 'rxjs/Rx';

@Component({
  selector: 'app-disconnect',
  templateUrl: './disconnect.component.html',
  providers: [RemoteService, SiteService, SiteSearchService]
})
export class DisconnectComponent {
  disconnect: Disconnect;
  confVisible = false;
  isDisconnect = false;
  isReconnect = false;
  isSave = false;
  isCancel = false;
  ticks = 0;
  trxId: any;
  result: any;
  timer: any;
  subscription: any;
  options = {
    message: '',
    closeOnOutsideClick: true,
    closeOnClick: true,
    closeOnSwipe: true,
    closeOnBackButton: true,
  }

  constructor(
    private service: RemoteService,
    private siteService: SiteService,
    private siteSearchService: SiteSearchService,
    private route: ActivatedRoute,
    private router: Router,
    private elementRef: ElementRef
  ) {
    this.disconnect = {
      'meterId': '8602463121',
      'status': '',
      'turnOn': false
    }
    this.service.getReadDisconnect('8602463121')
      .subscribe(
        resp => {
          this.trxId = resp;
          this.reqByTimer(this.trxId.data, 'get');
        }, err => {
          console.log(err);
        }
      );
  }
  reqByTimer(trxId: any, type: any) {
    this.timer = Observable.timer(1000, 1000);
    this.subscription = this.timer.subscribe(t => this.remoteResult(t, trxId, type));
  }
  remoteResult(tick: any, trxId: any, type: any) {
    console.log(tick);
    if (typeof (this.result) === 'undefined') {
      this.result = {
        'data': 'data is not ready'
      };
    }
    if (tick >= 120 || this.result.data !== 'data is not ready') {
      this.subscription.unsubscribe();
      if (this.result.data !== 'data is not ready') {
        if (type === 'get') {
          this.disconnect.status = this.result.response;
        } else {
          this.options.message = 'Status Updated';
          notify(this.options, 'success', 3000);
        }
      }
    }
    const mod = tick % 5;
    if (mod === 0) {
      this.service.getRemoteResult(trxId)
        .subscribe(
          resp => {
            this.result = resp;
            console.log('resp: ', resp);
          }, err => {
            console.log(err)
          }
        )
    }
  }
  save(e) {
    this.confVisible = true;
    // this.isSave = true;
    this.isCancel = false;
    event.preventDefault();
  }
  onHideConf() {
    this.confVisible = false;
  }
  onSaveConf() {
    this.service.saveDisconnect(this.disconnect)
      .subscribe(
        resp => {
          this.trxId = resp;
          this.reqByTimer(this.trxId.data, 'post');
        }, err => {
          console.log('err: ', err);
        }
      )
  }
  reconnecting(e) {
    this.disconnect.turnOn = true;
    this.isReconnect = true;
    this.isDisconnect = false;
    this.save(e)
  }
  disconnecting(e) {
    this.disconnect.turnOn = false;
    this.isDisconnect = true;
    this.isReconnect = false;
    this.save(e)
  }
}
