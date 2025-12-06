import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanierOuCommande } from './panier-ou-commande';

describe('PanierOuCommande', () => {
  let component: PanierOuCommande;
  let fixture: ComponentFixture<PanierOuCommande>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanierOuCommande]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanierOuCommande);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
