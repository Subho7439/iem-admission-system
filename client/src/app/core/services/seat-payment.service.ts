import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SeatAllocation, Seat, Payment, Receipt } from '../../models/models';

@Injectable({
  providedIn: 'root'
})
export class SeatPaymentService {
  private http = inject(HttpClient);
  private seatsUrl = 'http://localhost:5000/api/seats';
  private paymentsUrl = 'http://localhost:5000/api/payments';
  private receiptsUrl = 'http://localhost:5000/api/receipts';

  // Seat Allotment
  getMyAllotment(): Observable<{
    success: boolean;
    hasAllotment: boolean;
    allocation: SeatAllocation | null;
    payment: Payment | null;
    receipt: Receipt | null;
    isExpired: boolean;
  }> {
    return this.http.get<{
      success: boolean;
      hasAllotment: boolean;
      allocation: SeatAllocation | null;
      payment: Payment | null;
      receipt: Receipt | null;
      isExpired: boolean;
    }>(`${this.seatsUrl}/my-allotment`);
  }

  acceptSeat(allocationId: string): Observable<{ success: boolean; message: string; allocation: SeatAllocation; receipt: Receipt }> {
    return this.http.post<{ success: boolean; message: string; allocation: SeatAllocation; receipt: Receipt }>(
      `${this.seatsUrl}/accept`,
      { allocationId }
    );
  }

  declineSeat(allocationId: string, reason: string = ''): Observable<{ success: boolean; message: string; allocation: SeatAllocation }> {
    return this.http.post<{ success: boolean; message: string; allocation: SeatAllocation }>(
      `${this.seatsUrl}/decline`,
      { allocationId, reason }
    );
  }

  getProgrammeSeats(programmeId: string): Observable<{
    success: boolean;
    stats: { total: number; available: number; allotted: number; accepted: number; declined: number };
    seats: Seat[];
  }> {
    return this.http.get<{
      success: boolean;
      stats: { total: number; available: number; allotted: number; accepted: number; declined: number };
      seats: Seat[];
    }>(`${this.seatsUrl}/programme/${programmeId}`);
  }

  allotSeat(applicationId: string, category?: string, deadlineDays: number = 5): Observable<{
    success: boolean;
    message: string;
    allocation: SeatAllocation;
    seat: Seat;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      allocation: SeatAllocation;
      seat: Seat;
    }>(`${this.seatsUrl}/allot`, { applicationId, category, deadlineDays });
  }

  revokeSeat(payload: { seatId?: string; applicationId?: string; reason?: string }): Observable<{
    success: boolean;
    message: string;
    seat: Seat;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      seat: Seat;
    }>(`${this.seatsUrl}/revoke`, payload);
  }


  // Payment
  createPaymentOrder(allocationId: string, paymentMethod: string = 'NetBanking_Demo'): Observable<{
    success: boolean;
    message: string;
    payment: Payment;
  }> {
    return this.http.post<{ success: boolean; message: string; payment: Payment }>(
      `${this.paymentsUrl}/create-order`,
      { allocationId, paymentMethod }
    );
  }

  simulateOutcome(paymentId: string, outcome: string, failureReason: string = ''): Observable<{
    success: boolean;
    message: string;
    payment: Payment;
  }> {
    return this.http.post<{ success: boolean; message: string; payment: Payment }>(
      `${this.paymentsUrl}/${paymentId}/simulate-outcome`,
      { outcome, failureReason }
    );
  }

  getMyPayments(): Observable<{ success: boolean; payments: Payment[] }> {
    return this.http.get<{ success: boolean; payments: Payment[] }>(`${this.paymentsUrl}/my-payments`);
  }

  // Receipts
  getMyReceipt(): Observable<{ success: boolean; receipt: Receipt }> {
    return this.http.get<{ success: boolean; receipt: Receipt }>(`${this.receiptsUrl}/my-receipt`);
  }

  downloadReceiptPDF(receiptId: string): Observable<Blob> {
    return this.http.get(`${this.receiptsUrl}/${receiptId}/download-pdf`, {
      responseType: 'blob'
    });
  }
}
