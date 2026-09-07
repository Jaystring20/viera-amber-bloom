/**
 * PAD KÓLÓ Bot Handler
 * ═════════════════════════════════════════════════════════════════
 * Processes incoming WhatsApp messages and returns bot responses.
 * Integrates with Supabase for data operations.
 */

import { supabase } from '@/lib/supabase';
import { BotCommand, BotResponse } from './types';

/**
 * Parse inbound text into a structured BotCommand
 * Expected formats:
 *  - "CHECK ID FAADSS2"
 *  - "ISSUE PAD FAADSS2 FREE"
 *  - "ISSUE PAD FAADSS2 PAID"
 *  - "DEPOSIT 200"
 *  - "REPORT DAILY"
 *  - "REPORT CYCLE"
 */
export function parseCommand(text: string): BotCommand | null {
  const normalized = text.trim().toUpperCase();

  // CHECK ID
  const checkMatch = normalized.match(/^CHECK\s+ID\s+([A-Z0-9-]+)$/);
  if (checkMatch) {
    return { type: 'CHECK_ID', studentId: checkMatch[1] };
  }

  // ISSUE PAD
  const issueMatch = normalized.match(
    /^ISSUE\s+PAD\s+([A-Z0-9-]+)\s+(FREE|PAID)$/
  );
  if (issueMatch) {
    return {
      type: 'ISSUE_PAD',
      studentId: issueMatch[1],
      padType: issueMatch[2] as 'FREE' | 'PAID',
    };
  }

  // DEPOSIT
  const depositMatch = normalized.match(/^DEPOSIT\s+(\d+)$/);
  if (depositMatch) {
    return { type: 'DEPOSIT', amount: parseInt(depositMatch[1]) };
  }

  // REPORT
  const reportMatch = normalized.match(/^REPORT\s+(DAILY|CYCLE)$/);
  if (reportMatch) {
    return {
      type: 'REPORT',
      reportType: reportMatch[1] as 'DAILY' | 'CYCLE',
    };
  }

  return null;
}

/**
 * Execute a bot command and return response
 */
export async function executeCommand(
  command: BotCommand,
  fromPhone: string,
  schoolId?: string
): Promise<BotResponse> {
  try {
    switch (command.type) {
      case 'CHECK_ID':
        return await handleCheckId(command.studentId);

      case 'ISSUE_PAD':
        return await handleIssuePad(
          command.studentId,
          command.padType,
          schoolId,
          fromPhone
        );

      case 'DEPOSIT':
        return await handleDeposit(command.amount, schoolId, fromPhone);

      case 'REPORT':
        return await handleReport(command.reportType, schoolId, fromPhone);

      default:
        return {
          success: false,
          message: '❌ Command not recognized. Try: CHECK ID [student_id]',
        };
    }
  } catch (err) {
    console.error('[Bot] Command execution error:', err);
    return {
      success: false,
      message: '⚠️ System error. Please try again later.',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * CHECK ID — Look up student balance and free pads remaining
 */
async function handleCheckId(
  studentId: string,
  schoolId?: string
): Promise<BotResponse> {
  try {
    // Query student by ID globally (student IDs are unique across all schools)
    const { data: students, error } = await supabase
      .from('vagin_students')
      .select('id, name, school_id, balance_ngn, free_pads_used')
      .eq('student_id', studentId);

    if (error || !students || students.length === 0) {
      return {
        success: false,
        message: `❌ Student ID "${studentId}" not found.`,
      };
    }

    const student = students[0];
    const freePadsRemaining = Math.max(0, 1 - (student.free_pads_used || 0));
    const balance = student.balance_ngn || 0;

    return {
      success: true,
      message: `📊 Student: ${student.name}\nBalance: ₦${balance.toLocaleString('en-NG')}\nFree pads: ${freePadsRemaining}/1 remaining`,
      data: {
        name: student.name,
        balance,
        freePadsRemaining,
        studentId,
      },
    };
  } catch (err) {
    return {
      success: false,
      message: `⚠️ Error checking ID. ${err instanceof Error ? err.message : ''}`,
    };
  }
}

/**
 * ISSUE PAD — Record pad issuance and update balance
 */
async function handleIssuePad(
  studentId: string,
  padType: 'FREE' | 'PAID',
  schoolId?: string,
  matronPhone?: string
): Promise<BotResponse> {
  try {
    // Get student (using vagin_students table)
    let query = supabase
      .from('vagin_students')
      .select('id, name, school_id, balance_ngn, free_pads_used');

    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }

    const { data: students, error: studentError } = await query.eq(
      'student_id',
      studentId
    );

    if (studentError || !students || students.length === 0) {
      return {
        success: false,
        message: `❌ Student ID "${studentId}" not found.`,
      };
    }

    const student = students[0];

    // Check free pad quota
    if (padType === 'FREE' && (student.free_pads_used || 0) >= 1) {
      return {
        success: false,
        message: `❌ Cannot issue free pad to ${student.name}.\nFree pads used: ${student.free_pads_used}/1\nShe must pay ₦200 for the next pad.`,
      };
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from('pad_transactions')
      .insert({
        student_id: student.id,
        school_id: student.school_id,
        transaction_type: padType === 'FREE' ? 'free_pad' : 'paid_pad',
        quantity: 1,
        paid_amount: padType === 'PAID' ? 200 : null,
        issued_date: new Date().toISOString().split('T')[0],
        issued_by: matronPhone || 'WhatsApp Bot',
        notes: 'Issued via WhatsApp bot',
      });

    if (transactionError) {
      return {
        success: false,
        message: `⚠️ Error recording pad issuance: ${transactionError.message}`,
      };
    }

    // Update student balance and free pads count
    const newBalance =
      padType === 'PAID' ? Math.max(0, student.balance_ngn - 200) : student.balance_ngn;
    const newFreeUsed = (student.free_pads_used || 0) + (padType === 'FREE' ? 1 : 0);

    const { error: updateError } = await supabase
      .from('students')
      .update({
        balance_ngn: newBalance,
        free_pads_used: newFreeUsed,
      })
      .eq('id', student.id);

    if (updateError) {
      return {
        success: false,
        message: `⚠️ Error updating balance: ${updateError.message}`,
      };
    }

    return {
      success: true,
      message: `✓ Pad issued to ${student.name}\nType: ${padType === 'FREE' ? 'Free' : '₦200'}\nNew balance: ₦${newBalance.toLocaleString('en-NG')}\nFree pads remaining: ${Math.max(0, 1 - newFreeUsed)}/1`,
      data: {
        studentName: student.name,
        padType,
        newBalance,
        freePadsRemaining: Math.max(0, 1 - newFreeUsed),
      },
    };
  } catch (err) {
    return {
      success: false,
      message: `⚠️ Error issuing pad. ${err instanceof Error ? err.message : ''}`,
    };
  }
}

/**
 * DEPOSIT — Record bank deposit
 */
async function handleDeposit(
  amount: number,
  schoolId?: string,
  matronPhone?: string
): Promise<BotResponse> {
  try {
    if (!schoolId) {
      return {
        success: false,
        message: '❌ School not identified. Please register with your matron.',
      };
    }

    // Get school for context
    const { data: school } = await supabase
      .from('schools')
      .select('name, current_balance')
      .eq('id', schoolId)
      .single();

    const schoolName = school?.name || 'Unknown School';
    const previousBalance = school?.current_balance || 0;

    // Record deposit in transactions
    const { error } = await supabase
      .from('pad_transactions')
      .insert({
        school_id: schoolId,
        transaction_type: 'deposit',
        pads_issued: 0,
        amount_ngn: amount,
        source: 'matron_deposit',
        notes: `Deposit via WhatsApp from ${matronPhone}`,
      });

    if (error) {
      return {
        success: false,
        message: `⚠️ Error recording deposit: ${error.message}`,
      };
    }

    // Update school balance
    const newBalance = previousBalance + amount;
    await supabase
      .from('schools')
      .update({ current_balance: newBalance })
      .eq('id', schoolId);

    return {
      success: true,
      message: `✓ Deposit recorded\nAmount: ₦${amount.toLocaleString('en-NG')}\nSchool: ${schoolName}\nNew balance: ₦${newBalance.toLocaleString('en-NG')}`,
      data: {
        amount,
        schoolName,
        newBalance,
      },
    };
  } catch (err) {
    return {
      success: false,
      message: `⚠️ Error recording deposit. ${err instanceof Error ? err.message : ''}`,
    };
  }
}

/**
 * REPORT — Send daily or cycle summary
 */
async function handleReport(
  reportType: 'DAILY' | 'CYCLE',
  schoolId?: string,
  matronPhone?: string
): Promise<BotResponse> {
  try {
    if (!schoolId) {
      return {
        success: false,
        message: '❌ School not identified. Please register with your matron.',
      };
    }

    const today = new Date().toISOString().split('T')[0];

    // Get today's transactions
    let query = supabase
      .from('pad_transactions')
      .select('transaction_type, quantity, paid_amount')
      .eq('school_id', schoolId);

    if (reportType === 'DAILY') {
      query = query.eq('issued_date', today);
    }

    const { data: transactions } = await query;

    const summary = {
      freeIssuedToday: transactions?.filter(
        (t) => t.transaction_type === 'free_pad'
      ).length || 0,
      paidIssuedToday: transactions?.filter(
        (t) => t.transaction_type === 'paid_pad'
      ).length || 0,
      revenueToday:
        transactions
          ?.filter((t) => t.transaction_type === 'paid_pad')
          .reduce((sum, t) => sum + (t.paid_amount || 0), 0) || 0,
    };

    const totalPads = summary.freeIssuedToday + summary.paidIssuedToday;

    return {
      success: true,
      message:
        reportType === 'DAILY'
          ? `📈 Today's Report\nPads issued: ${totalPads}\nFree: ${summary.freeIssuedToday}\nPaid: ${summary.paidIssuedToday}\nRevenue: ₦${summary.revenueToday.toLocaleString('en-NG')}`
          : `📊 Cycle Report\nTotal pads issued: ${totalPads}\nRevenue: ₦${summary.revenueToday.toLocaleString('en-NG')}`,
      data: summary,
    };
  } catch (err) {
    return {
      success: false,
      message: `⚠️ Error generating report. ${err instanceof Error ? err.message : ''}`,
    };
  }
}

/**
 * Handle unknown commands with helpful guidance
 */
export function getHelpMessage(): string {
  return `📱 PAD KÓLÓ Bot Commands:\n\n1️⃣ CHECK ID [student_id]\nExample: CHECK ID FAADSS2\n\n2️⃣ ISSUE PAD [student_id] [FREE|PAID]\nExample: ISSUE PAD FAADSS2 FREE\n\n3️⃣ DEPOSIT [amount]\nExample: DEPOSIT 1000\n\n4️⃣ REPORT [DAILY|CYCLE]\nExample: REPORT DAILY`;
}
