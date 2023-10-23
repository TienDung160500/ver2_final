import { IChiTietSanXuat } from 'app/entities/chi-tiet-san-xuat/chi-tiet-san-xuat.model';
import { ISanXuatHangNgay } from 'app/entities/san-xuat-hang-ngay/san-xuat-hang-ngay.model';
import { IChiTietKichBan } from 'app/entities/chi-tiet-kich-ban/chi-tiet-kich-ban.model';
import { FormBuilder } from '@angular/forms';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { Component, OnInit, Input, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
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
  thietBiUrl = this.applicationConfigService.getEndpointFor('api/thiet-bi/danh-sach-thong-so-thiet-bi');
  kichBanDoiChieu = this.applicationConfigService.getEndpointFor('api/kich-ban');
  SanXuatHangNgayDoiChieu = this.applicationConfigService.getEndpointFor('api/chi-tiet-san-xuat');

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
  chiTietSanXuats: IChiTietSanXuat[] | null = [];
  sanXuatHangNgay: ISanXuatHangNgay | null = null;

  kichBans?: IKichBan[];
  isLoading = false;
  totalItems = 0;
  itemsPerPage = ITEMS_PER_PAGE;
  page?: number;
  predicate!: string;
  ascending!: boolean;
  ngbPaginationPage = 1;

  searchResults: IKichBan[] = [];

  listNhomThietBi: { loaiThietBi: string; maThietBi: string; dayChuyen: string }[] = [];
  listMaThietBi: { maThietBi: string }[] = [];
  listOfChiTietKichBan: {
    id: number;
    idKichBan: number | null | undefined;
    maKichBan: string | null | undefined;
    thongSo: string | null | undefined;
    minValue: number;
    maxValue: number;
    trungbinh: number;
    donVi: string;
    phanLoai: string | null | undefined;
  }[] = [];

  editForm = this.formBuilder.group({
    id: [],
    maKichBan: [],
    maThietBi: [],
    loaiThietBi: [],
    dayChuyen: [],
    maSanPham: [],
    versionSanPham: [],
    ngayTao: [],
    timeUpdate: [],
    updateBy: [],
    trangThai: [],
  });

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
  dongBo(id: number | undefined): void {
    this.activatedRoute.data.subscribe(({ kichBan }) => {
      this.kichBan = kichBan;
      console.log('kichban: ', this.kichBan);
    });
    console.log('id kịch bản: ', id);
    this.http.get<any>(`${this.resourceUrlKB}/${id as number}`).subscribe(res => {
      this.chiTietKichBans = res;
      console.log('res :', res);
      console.log('chi tiet kich ban :', this.chiTietKichBans);
    });
  }
  ngOnInit(): void {
    this.handleNavigation();
    this.formSearch.valueChanges.subscribe(data => {
      this.timKiemKichBan(data);
    });
  }

  trackId(_index: number, item: IKichBan): number {
    return item.id!;
  }

  openModal(id: number | undefined, maKichBan: string | null | undefined, content: TemplateRef<any>): void {
    this.modalService.open(content, { size: 'lg' });
    console.log(maKichBan);

    // kich ban doi chieu
    this.http.get<any>(`${this.kichBanDoiChieu}/${id as number}`).subscribe(res => {
      this.kichBan = res;
      console.log('api', this.kichBan);
    });

    // san xuat hang ngay doi chieu
    this.http.get<any>(`${this.SanXuatHangNgayDoiChieu}/${maKichBan as string}`).subscribe(res => {
      this.chiTietSanXuats = res;
      console.log('api-sxhn', res);
    });

    this.http.get<any>(`${this.resourceUrlKB}/${id as number}`).subscribe(res => {
      this.chiTietKichBans = res;

      console.log('res1 :', res);
      console.log('chi tiet kich ban1 :', this.chiTietKichBans);
    });
  }

  // openModal(id: number | undefined, content: TemplateRef<any>): void {
  //   this.modalService.open(content, { size: 'lg' });

  //   this.activatedRoute.data.subscribe(({ kichBan }) => {
  //     this.kichBan = kichBan;
  //     console.log('kichban1: ', kichBan);
  //     console.log(this.kichBan);

  //     console.log('id kịch bản: ', id);
  //     this.http.get<any>(`${this.resourceUrlKB}/${id as number}`).subscribe(res => {
  //       this.chiTietKichBans = res;

  //       console.log('res1:', res);
  //       console.log('chi tiet kich ban1:', this.chiTietKichBans);
  //     });
  //   });
  // }

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

  sort(): string[] {
    const result = [this.predicate + ',' + (this.ascending ? ASC : DESC)];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  handleNavigation(): void {
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

  onSuccess(data: IKichBan[] | null, headers: HttpHeaders, page: number, navigate: boolean): void {
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

  onError(): void {
    this.ngbPaginationPage = this.page ?? 1;
  }

  getThietBi(): void {
    this.listMaThietBi = [];
    this.listOfChiTietKichBan = [];
    const timKiem = {
      maThietBi: this.editForm.get(['maThietBi'])!.value,
      loaiThietBi: this.editForm.get(['loaiThietBi'])!.value,
      hangTms: '',
      thongSo: '',
      moTa: '',
      status: '',
      phanLoai: '',
    };
    // đây là api request về db để lấy chi tiết kịch bản, đọc kĩ thằng này rồi copy sang bên kia
    this.http.post<IChiTietKichBan[]>(this.thietBiUrl, timKiem).subscribe((res: IChiTietKichBan[]) => {
      // khoi tao danh sach
      for (let i = 0; i < res.length; i++) {
        const newRows: {
          id: number;
          idKichBan: number | null | undefined;
          maKichBan: string;
          thongSo: string | null | undefined;
          minValue: number;
          maxValue: number;
          trungbinh: number;
          donVi: string;
          phanLoai: string | null | undefined;
        } = {
          id: 0,
          idKichBan: undefined,
          maKichBan: '',
          thongSo: res[i].thongSo,
          minValue: 0,
          maxValue: 0,
          trungbinh: 0,
          donVi: '',
          phanLoai: res[i].phanLoai,
        };
        this.listOfChiTietKichBan.push(newRows);
      }
      // console.log('thiet bi: ', this.listOfChiTietKichBan);
      // console.log('tim kiem: ', timKiem);
    });
    //set dây chuyền tương ứng theo mã thiết bị
    for (let i = 0; i < this.listNhomThietBi.length; i++) {
      if (this.maThietBi === this.listNhomThietBi[i].maThietBi) {
        this.dayChuyen = this.listNhomThietBi[i].dayChuyen;
      }
    }
    // console.log('thiet bi: ', res;
    // console.log('tim kiem: ', timKiem);
  }
}
