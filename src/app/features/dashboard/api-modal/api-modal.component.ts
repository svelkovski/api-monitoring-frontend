import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Api } from '../../../core/model/api.model';
import { CreateApiRequest } from '../../../core/model/create-api-request.model';

@Component({
  selector: 'app-api-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './api-modal.component.html',
})
export class ApiModalComponent implements OnInit {
  @Input() editingApi: Api | null = null;
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  private apiService = inject(ApiService);

  form = new FormGroup({
    name: new FormControl('', Validators.required),
    url: new FormControl('', [
      Validators.required,
      Validators.pattern('https?://.+'),
    ]),
    method: new FormControl('GET', Validators.required),
  });

  formError = '';
  formLoading = false;

  ngOnInit() {
    if (this.editingApi) {
      this.form.patchValue({
        name: this.editingApi.name,
        url: this.editingApi.url,
        method: this.editingApi.method,
      });
    }
  }

  submit() {
    if (this.form.invalid) return;

    this.formLoading = true;
    this.formError = '';

    const data: CreateApiRequest = {
      name: this.form.value.name!,
      url: this.form.value.url!,
      method: this.form.value.method!,
    };

    const request$ = this.editingApi
      ? this.apiService.update(this.editingApi.id, data)
      : this.apiService.create(data);

    request$.subscribe({
      next: () => {
        this.formLoading = false;
        this.save.emit();
      },
      error: () => {
        this.formError = 'Something went wrong. Please try again.';
        this.formLoading = false;
      },
    });
  }

  onCancel() {
    this.cancel.emit();
  }
}
