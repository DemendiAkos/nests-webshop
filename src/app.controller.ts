import { Body, Controller, Get, Post, Query, Render, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { NewPurchaseDto } from './newPurchase.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  getHello() {
    return {
      message: this.appService.getHello()
    };
  }


  #purchases = [
    {
      product: 'Laptop',
      name: 'John Doe',
      address: '1234 Elm St',
      destination: '1234 Elm St',
      coupon: 'PT-1255',
      creditcard: '3214-3213-5214-3214',
      expirationDate: '12/23',
      cvc: 123,
    }
  ];


  @Get('shop')
  @Render('webShopPage')
  getItem(){
  }

   
  @Get('buy')
  @Render('BuyProduct')
  Payment (@Query('laptop') laptop: string,
          @Query('image') image: string) {
    return {
      laptop: laptop,
      errors: [],
      data: {}
    }
  }

  @Post('buy')
  registerBuyer(
    @Body() buyerData: NewPurchaseDto,
    @Res() response: Response) {
    let newpurchase = {
      product: buyerData.product,
      name: buyerData.name,
      address: buyerData.address,
      destination: buyerData.destination,
      coupon: buyerData.coupon,
      creditcard: buyerData.creditcard,
      expirationDate: buyerData.expirationDate,
      cvc: buyerData.cvc,
    }

    console.log(newpurchase);

    //Check Errors
    const errors: string[] = [];
    if (!newpurchase.name) {
      errors.push('Name is required');
    }
    if (!newpurchase.address) {
      errors.push('Address is required');
    }
    if (!newpurchase.destination) {
      errors.push('Destination is required');
    }
    if (!newpurchase.creditcard) {
      errors.push('Credit Card is required');
    }

    if (!newpurchase.expirationDate) {
      errors.push('Expiration Date is required');
    } else {
      const expirationDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!expirationDateRegex.test(newpurchase.expirationDate)) {
        errors.push('Expiration Date must be in the format MM/YY');
      } else {
        const [month, year] = newpurchase.expirationDate.split('/').map(Number);
        const now = new Date();
        const expiration = new Date(2000 + year, month - 1);
        if (expiration < now) {
          errors.push('Expiration Date is expired');
        }
      }
    }
    const creditCardRegex = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
    if (!creditCardRegex.test(newpurchase.creditcard)) {
      errors.push('Credit Card must be in the format XXXX-XXXX-XXXX-XXXX');
    }


    if (!newpurchase.cvc) {
      errors.push('CVC is required');
    }
    if (newpurchase.cvc > 999 || newpurchase.cvc < 100) {
      errors.push('CVC must be 3 digits');
    }

    const couponRegex = /^[A-Za-z]{2}-\d{4}$/;
    if (newpurchase.coupon &&!couponRegex.test(newpurchase.coupon)) {
      errors.push('Coupon code must be in the format: Letter + Letter + "-" + 4 numbers');
    }

    let data = {
      product: buyerData.product,
      name: buyerData.name,
      address: buyerData.address,
      destination: buyerData.destination,
      coupon: buyerData.coupon,
    }
    
    if (errors.length > 0) {
      response.render('buyProduct', {
        laptop: buyerData.product,
        errors,
        data
      })
      return;
    }

    console.log(newpurchase);
    this.#purchases.push(newpurchase);

    response.redirect('/success');
  }

  @Get('success')
  @Render('success')
  success() {
    return {
      purchase:  {
        name: this.#purchases[this.#purchases.length - 1].name,
        product: this.#purchases[this.#purchases.length - 1].product,
      }
    }
  }

}
