import { TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let apiService: jasmine.SpyObj<ApiService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockPage = {
    content: [
      {
        id: 1,
        name: 'Test API',
        url: 'https://test.com',
        method: 'GET',
        status: 'UP',
        responseTime: 100,
        responseCode: 200,
        checkedAt: '',
      },
      {
        id: 2,
        name: 'Down API',
        url: 'https://down.com',
        method: 'POST',
        status: 'DOWN',
        responseTime: null,
        responseCode: 0,
        checkedAt: '',
      },
    ],
    totalElements: 2,
    totalPages: 1,
    number: 0,
    size: 10,
  };

  beforeEach(async () => {
    apiService = jasmine.createSpyObj('ApiService', [
      'getAll',
      'delete',
      'triggerCheck',
    ]);
    authService = jasmine.createSpyObj('AuthService', [
      'getUsername',
      'logout',
      'isLoggedIn',
    ]);

    apiService.getAll.and.returnValue(of(mockPage));
    authService.getUsername.and.returnValue('testuser');

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: apiService },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  it('should load APIs on init', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(apiService.getAll).toHaveBeenCalled();
    expect(component.apis.length).toBe(2);
    expect(component.loading).toBeFalse();
    discardPeriodicTasks();
  }));

  it('should open modal on openCreate', () => {
    component.openCreate();
    expect(component.showModal).toBeTrue();
    expect(component.editingApi).toBeNull();
  });

  it('should open modal with api on openEdit', () => {
    const fakeEvent = new MouseEvent('click');
    const api = mockPage.content[0];
    component.openEdit(api as any, fakeEvent);
    expect(component.showModal).toBeTrue();
    expect(component.editingApi).toEqual(api as any);
  });

  it('should close modal on closeModal', () => {
    component.showModal = true;
    component.closeModal();
    expect(component.showModal).toBeFalse();
  });

  it('should remove api from list on confirmDelete', () => {
    const fakeEvent = new MouseEvent('click');
    component.apis = mockPage.content as any;
    apiService.delete.and.returnValue(of({} as any));

    component.confirmDelete(mockPage.content[0] as any, fakeEvent);
    
    expect(apiService.delete).toHaveBeenCalledWith(1);
    expect(component.apis.length).toBe(1);
    expect(component.apis[0].id).toBe(2);
  });

  it('should unsubscribe on destroy', () => {
    component.ngOnInit();
    spyOn(component['subscription']!, 'unsubscribe');
    component.ngOnDestroy();
    expect(component['subscription']!.unsubscribe).toHaveBeenCalled();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });
});
