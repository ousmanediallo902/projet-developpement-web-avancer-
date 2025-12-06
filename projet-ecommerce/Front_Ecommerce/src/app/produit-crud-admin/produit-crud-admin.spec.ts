import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitCrudAdmin } from './produit-crud-admin';

describe('ProduitCrudAdmin', () => {
  let component: ProduitCrudAdmin;
  let fixture: ComponentFixture<ProduitCrudAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduitCrudAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitCrudAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
