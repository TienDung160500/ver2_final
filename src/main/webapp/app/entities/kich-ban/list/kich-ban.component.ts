import { IChiTietKichBan } from 'app/entities/chi-tiet-kich-ban/chi-tiet-kich-ban.model';
import { FormBuilder } from '@angular/forms';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { HttpHeaders, HttpResponse, HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IKichBan } from '../kich-ban.model';

import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/config/pagination.constants';
import { KichBanService } from '../service/kich-ban.service';
import { KichBanDeleteDialogComponent } from '../delete/kich-ban-delete-dialog.component';

@Component({
  selector: 'jhi-kich-ban',
  templateUrl: './kich-ban.component.html',
  styleUrls: ['./kich-ban.component.css'],
})
export class KichBanComponent implements OnInit {
  resourceUrl = this.applicationConfigService.getEndpointFor('api/kich-bans/tim-kiem');
  resourceUrlKB = this.applicationConfigService.getEndpointFor('api/kich-ban/thong-so-kich-ban');

  formSearch = this.formBuilder.group({
    maKichBan: '',
    maThietBi: '',
    loaiThietBi: '',
    dayChuyen: '',
    maSanPham: '',
    versionSanPham: '',
    ngayTao: null,
    timeUpdate: null,
    updateBy: '',
    trangThai: '',
  });

  @Input() itemPerPage = 10;

  @Input() maKichBan = '';
  @Input() maThietBi = '';
  @Input() loaiThietBi = '';
  @Input() dayChuyen = '';
  @Input() maSanPham = '';
  @Input() versionSanPham = '';
  @Input() ngayTao = null;
  @Input() timeUpdate = null;
  @Input() updateBy = '';
  @Input() trangThai = '';

  // lưu từ khóa tìm kiếm
  searchKeyword = '';
  // lưu kết quả tìm kiếm
  seachResult: any[] = [];
  // lưu các gợi ý tìm kiếm
  searchSuggestions: string[] = [];
  // hiển thị danh sácsh tìm kiếm
  showSuggestions = false;
  // theo dõi sự kiện keyup trên ô tìm kiếm
  @ViewChild('searchInput', { static: true })
  searchInput!: ElementRef;

  chiTietKichBans: IChiTietKichBan[] | null = [];
  kichBan: IKichBan | null = null;

  kichBans?: IKichBan[];
  isLoading = false;
  totalItems = 0;
  itemsPerPage = ITEMS_PER_PAGE;
  page?: number;
  predicate!: string;
  ascending!: boolean;
  ngbPaginationPage = 1;

  searchResults: IKichBan[] = [];

  constructor(
    protected kichBanService: KichBanService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected modalService: NgbModal,
    protected http: HttpClient,
    protected applicationConfigService: ApplicationConfigService,
    protected formBuilder: FormBuilder
  ) {}

  timKiemKichBan(data: any, page?: number, dontNavigate?: boolean): void {
    const pageToLoad: number = page ?? this.page ?? 1;
    this.searchResults = [];

    this.http.post<any>(this.resourceUrl, data).subscribe(res => {
      this.kichBans = res;

      this.onSuccess(res.kichBans, res.headers, pageToLoad, !dontNavigate);
    });
  }

  loadPage(): void {
    this.timKiemKichBan(this.formSearch.value);
  }

  ngOnInit(): void {
    this.handleNavigation();
    this.formSearch.valueChanges.subscribe(data => {
      this.timKiemKichBan(data);
    });
    this.activatedRoute.data.subscribe(({ kichBan }) => {
      this.kichBan = kichBan;
    });
    // lay thong tin thong so thiet bi
    if (this.kichBan?.id) {
      this.http.get<any>(`${this.resourceUrlKB}/${this.kichBan.id}`).subscribe(res => {
        this.chiTietKichBans = res;
        console.log('res :', res);
        console.log('chi tiet kich ban :', this.chiTietKichBans);
      });
    }
  }

  trackId(_index: number, item: IKichBan): number {
    return item.id!;
  }

  openModal(content: any): void {
    this.modalService.open(content, { size: 'lg' });
  }

  delete(kichBan: IKichBan): void {
    const modalRef = this.modalService.open(KichBanDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.kichBan = kichBan;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.loadPage();
      }
    });
  }

  protected sort(): string[] {
    const result = [this.predicate + ',' + (this.ascending ? ASC : DESC)];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  protected handleNavigation(): void {
    combineLatest([this.activatedRoute.data, this.activatedRoute.queryParamMap]).subscribe(([data, params]) => {
      // cái này chỉr sẻt kieu any cho gia tri dau tien, cai thu 2 phai tu set
      const page = params.get('page');
      const pageNumber = +(page ?? 1);
      const sort = (params.get(SORT) ?? data['defaultSort']).split(',');
      const predicate = sort[0];
      const ascending = sort[1] === ASC;
      if (pageNumber !== this.page || predicate !== this.predicate || ascending !== this.ascending) {
        this.predicate = predicate;
        this.ascending = ascending;
        this.loadPage();
      }
    });
  }

  protected onSuccess(data: IKichBan[] | null, headers: HttpHeaders, page: number, navigate: boolean): void {
    this.totalItems = Number(headers.get('X-Total-Count'));
    this.page = page;
    if (navigate) {
      this.router.navigate(['/kich-ban'], {
        queryParams: {
          page: this.page,
          size: this.itemsPerPage,
          sort: this.predicate + ',' + (this.ascending ? ASC : DESC),
        },
      });
    }
    this.kichBans = data ?? [];
    this.ngbPaginationPage = this.page;
  }

  protected onError(): void {
    this.ngbPaginationPage = this.page ?? 1;
  }
}
