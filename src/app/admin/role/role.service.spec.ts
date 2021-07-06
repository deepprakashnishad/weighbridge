import { TestBed } from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import { RoleService } from './role.service';

describe('RoleService', () => {

	let service: RoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [RoleService]
    });
  	service = TestBed.get(RoleService);
  });

  it('should be created', () => {
    // const service: RoleService = TestBed.get(RoleService);
    expect(service).toBeTruthy();
  });

  it('#getRoles should get list of roles', ()=>{
  	expect(service).toBeTruthy();
  });
});
