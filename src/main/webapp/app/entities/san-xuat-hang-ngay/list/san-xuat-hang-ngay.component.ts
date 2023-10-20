// import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { IThietBi } from 'app/entities/thiet-bi/thiet-bi.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpHeaders, HttpResponse, HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ISanXuatHangNgay } from '../san-xuat-hang-ngay.model';

import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/config/pagination.constants';
import { SanXuatHangNgayService } from '../service/san-xuat-hang-ngay.service';
import { SanXuatHangNgayDeleteDialogComponent } from '../delete/san-xuat-hang-ngay-delete-dialog.component';

@Component({
  selector: 'jhi-san-xuat-hang-ngay',
  templateUrl: './san-xuat-hang-ngay.component.html',
  styleUrls: ['./san-xuat-hang-ngay.component.css'],
})
export class SanXuatHangNgayComponent implements OnInit {
  resourceUrl = this.applicationConfigService.getEndpointFor('api/san-xuat-hang-ngay/tim-kiem');

  form: FormGroup = new FormGroup({});

  maKichBan = '';
  maThietBi = '';
  loaiThietBi = '';
  dayChuyen = '';
  maSanPham = '';
  versionSanPham = '';
  ngayTao = null;
  timeUpdate = null;
  trangThai = '';

  sanXuatHangNgays?: ISanXuatHangNgay[];
  isLoading = false;
  totalItems = 0;
  itemsPerPage = ITEMS_PER_PAGE;
  page?: number;
  predicate!: string;
  ascending!: boolean;
  ngbPaginationPage = 1;

  thietBisSharedCollection: IThietBi[] = [];

  editForm = this.fb.group({
    id: [],
    maThietBi: [],
    loaiThietBi: [],
    hangTms: [],
    thongSo: [],
    moTa: [],
    trangThai: [],
    phanLoai: [],
    thietBi: [],
  });

  searchResults: ISanXuatHangNgay[] = [];

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
  $envent!: KeyboardEvent;

  @ViewChild('multiSelect') multiSelect: any;
  loadContent = false;
  name = 'Cricketers';

  // dropdownList: { item_id: number; item_text: string }[] = [];
  // selectedList: { item_id: number; item_text: string }[] = [];
  // dropdownSettings?: IDropdownSettings;

  constructor(
    protected sanXuatHangNgayService: SanXuatHangNgayService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected modalService: NgbModal,
    protected fb: FormBuilder,
    protected http: HttpClient,
    protected applicationConfigService: ApplicationConfigService
  ) {}

  timKiemSanXuatHangNgay(): void {
    //request den server
    const timKiem = {
      maKichBan: this.maKichBan,
      maThietBi: this.maThietBi,
      loaiThietBi: this.loaiThietBi,
      dayChuyen: this.dayChuyen,
      maSanPham: this.maSanPham,
      versionSanPham: this.versionSanPham,
      ngayTao: this.ngayTao,
      timeUpdate: this.timeUpdate,
      updateBy: '',
      trangThai: this.trangThai,
    };
    this.http.post<any>(this.resourceUrl, timKiem).subscribe(res => {
      //luu du lieu tra ve de hien thi len front-end
      this.sanXuatHangNgays = res;
    });
  }

  checkAndShowAutocomplete(): void {
    if (this.maKichBan && this.maKichBan.length > 0) {
      this.showAutoComplete();
    }
  }

  showAutoComplete(): void {
    this.sanXuatHangNgays;
  }

  trackThietBiById(_index: number, item: IThietBi): number {
    return item.id!;
  }

  loadPage(page?: number, dontNavigate?: boolean): void {
    this.isLoading = true;
    const pageToLoad: number = page ?? this.page ?? 1;

    this.sanXuatHangNgayService
      .query({
        page: pageToLoad - 1,
        size: this.itemsPerPage,
        sort: this.sort(),
      })
      .subscribe({
        next: (res: HttpResponse<ISanXuatHangNgay[]>) => {
          this.isLoading = false;
          this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate);
          this.searchResults = res.body as any;
        },
        error: () => {
          this.isLoading = false;
          this.onError();
        },
      });
  }

  ngOnInit(): void {
    this.handleNavigation();

    // this.dropdownList = [
    //   { item_id: 1, item_text: 'Mumbai' },
    //   { item_id: 2, item_text: 'Bangaluru' },
    //   { item_id: 3, item_text: 'Pune' },
    //   { item_id: 4, item_text: 'Navsari' },
    //   { item_id: 5, item_text: 'New Delhi' },
    // ];

  //   this.selectedList = {
  //     singleSelection: false,
  //     idField: 'item_id',
  //     textField: 'item_text',
  //     enableCheckAll: true,
  //     selectAllText: 'Chọn All',
  //     unSelectAllText: 'Hủy chọn',
  //     allowSearchFilter: true,
  //     limitSelection: -1,
  //     clearSearchFilter: true,
  //     maxHeight: 197,
  //     itemsShowLimit: 3,
  //     searchPlaceholderText: 'Tìm kiếm',
  //     noDataAvailablePlaceholderText: 'Không có dữ liệu',
  //     closeDropDownOnSelection: false,
  //     showSelectedItemsAtTop: false,
  //     defaultOpen: false,
  //   };
  //   this.setForm();
  // }

    // this.dropdownSettings = {
    //   singleSelection: false,
    //   idField: 'item_id',
    //   textField: 'item_text',
    //   selectAllText: 'Select All',
    //   unSelectAllText: 'UnSelect All',
    //   itemsShowLimit: 3,
    //   allowSearchFilter: true,
    // };
  }
  // onItemSelect(item: any): void {
  //   console.log(item);
  //   console.log(this.selectedList);
  // }
  // OnItemDeSelect(item: any): void {
  //   console.log(item);
  //   console.log(this.selectedList);
  // }
  onSelectAll(items: any): void {
    console.log(items);
  }
  onDeSelectAll(items: any): void {
    console.log(items);
  }

  trackId(_index: number, item: ISanXuatHangNgay): number {
    return item.id!;
  }

  delete(sanXuatHangNgay: ISanXuatHangNgay): void {
    const modalRef = this.modalService.open(SanXuatHangNgayDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.sanXuatHangNgay = sanXuatHangNgay;
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
      const page = params.get('page');
      const pageNumber = +(page ?? 1);
      const sort = (params.get(SORT) ?? data['defaultSort']).split(',');
      const predicate = sort[0];
      const ascending = sort[1] === ASC;
      if (pageNumber !== this.page || predicate !== this.predicate || ascending !== this.ascending) {
        this.predicate = predicate;
        this.ascending = ascending;
        this.loadPage(pageNumber, true);
      }
    });
  }

  protected onSuccess(data: ISanXuatHangNgay[] | null, headers: HttpHeaders, page: number, navigate: boolean): void {
    this.totalItems = Number(headers.get('X-Total-Count'));
    this.page = page;
    if (navigate) {
      this.router.navigate(['/san-xuat-hang-ngay'], {
        queryParams: {
          page: this.page,
          size: this.itemsPerPage,
          sort: this.predicate + ',' + (this.ascending ? ASC : DESC),
        },
      });
    }
    this.sanXuatHangNgays = data ?? [];
    this.ngbPaginationPage = this.page;
  }

  protected onError(): void {
    this.ngbPaginationPage = this.page ?? 1;
  }
}
