import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ILenhSanXuat, LenhSanXuat } from '../lenh-san-xuat.model';
import { LenhSanXuatService } from '../service/lenh-san-xuat.service';

@Component({
  selector: 'jhi-lenh-san-xuat-update',
  templateUrl: './lenh-san-xuat-update.component.html',
})
export class LenhSanXuatUpdateComponent implements OnInit {
  isSaving = false;

  editForm = this.fb.group({
    id: [],
    maLenhSanXuat: [null, [Validators.required]],
    sapCode: [],
    sapName: [],
    workOrderCode: [],
    version: [],
    storageCode: [],
    totalQuantity: [],
    createBy: [],
    entryTime: [],
    trangThai: [],
    comment: [],
  });

  constructor(protected lenhSanXuatService: LenhSanXuatService, protected activatedRoute: ActivatedRoute, protected fb: FormBuilder) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ lenhSanXuat }) => {
      this.updateForm(lenhSanXuat);
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const lenhSanXuat = this.createFromForm();
    if (lenhSanXuat.id !== undefined) {
      this.subscribeToSaveResponse(this.lenhSanXuatService.update(lenhSanXuat));
    } else {
      this.subscribeToSaveResponse(this.lenhSanXuatService.create(lenhSanXuat));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ILenhSanXuat>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(lenhSanXuat: ILenhSanXuat): void {
    this.editForm.patchValue({
      id: lenhSanXuat.id,
      maLenhSanXuat: lenhSanXuat.maLenhSanXuat,
      sapCode: lenhSanXuat.sapCode,
      sapName: lenhSanXuat.sapName,
      workOrderCode: lenhSanXuat.workOrderCode,
      version: lenhSanXuat.version,
      storageCode: lenhSanXuat.storageCode,
      totalQuantity: lenhSanXuat.totalQuantity,
      createBy: lenhSanXuat.createBy,
      entryTime: lenhSanXuat.entryTime,
      trangThai: lenhSanXuat.trangThai,
      comment: lenhSanXuat.comment,
    });
  }

  protected createFromForm(): ILenhSanXuat {
    return {
      ...new LenhSanXuat(),
      id: this.editForm.get(['id'])!.value,
      maLenhSanXuat: this.editForm.get(['maLenhSanXuat'])!.value,
      sapCode: this.editForm.get(['sapCode'])!.value,
      sapName: this.editForm.get(['sapName'])!.value,
      workOrderCode: this.editForm.get(['workOrderCode'])!.value,
      version: this.editForm.get(['version'])!.value,
      storageCode: this.editForm.get(['storageCode'])!.value,
      totalQuantity: this.editForm.get(['totalQuantity'])!.value,
      createBy: this.editForm.get(['createBy'])!.value,
      entryTime: this.editForm.get(['entryTime'])!.value,
      trangThai: this.editForm.get(['trangThai'])!.value,
      comment: this.editForm.get(['comment'])!.value,
    };
  }
}
