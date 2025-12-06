import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsProduct } from './comments-product';

describe('CommentsProduct', () => {
  let component: CommentsProduct;
  let fixture: ComponentFixture<CommentsProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentsProduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentsProduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
