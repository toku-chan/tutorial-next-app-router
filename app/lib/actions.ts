// use serverとすることで、このファイルでexportされた関数は全てサーバー関数として扱われる。
// 今回はファイルで指定しているが、関数の中でuse serverと記述するとその関数のみサーバー関数として利用することができる。
'use server';

import { sql } from "@vercel/postgres";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.'
  }),
  amount: z.coerce.number().gt(0, {
    message: 'Please enter an amount greater than $0.'
  }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.'
  }),
  date: z.string()
});

// 請求書を作成するときのフォーム型
// idとdateは除外している
const CreateInvoice = InvoiceSchema.omit({
  id: true,
  date: true
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
}

// prevState は useFormStateで渡された状態を含む
export async function createInvoice(prevState: State, formData: FormData) {
  // 多くのフォームデータを持つ場合は、submitで送られてきたデータを回して、自動でobjectを生成する以下の方法の方が良い。
  // const rawFormDataTest = Object.fromEntries(formData.entries())
  // console.log(rawFormDataTest);

  const validateFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  });

  if(!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.'
    }
  }

  const { data } = validateFields;

  // セント単位で計算する
  const  amountInCents = data.amount * 100;

  // invoiceの作成日を作成する
  const date = new Date().toISOString().split('T')[0];

  try {
    // SQLクエリを作成
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${data.customerId}, ${amountInCents}, ${data.status}, ${date})
    `;
  } catch (e) {
    return {
      message: 'Database Error: Failed to Create Invoice.'
    }
  }

  // SQLにデータを登録するので、キャッシュをクリアして、サーバーに新しくリクエストを実行する
  // createInvoiceが実行されると、該当のpathは再検証される
  revalidatePath('/dashboard/invoices');

  // 請求書作成画面から請求書一覧画面に遷移する
  // ※ エラーハンドリングは次の章で行う
  redirect('/dashboard/invoices');
};

// 請求書内容を更新する際のフォーム型
const UpdateInvoice = InvoiceSchema.omit({
  id: true,
  date: true
});

export async function updateInvoice(id: string, prevData: State, formData: FormData) {
  const validateFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  });

  console.log(validateFields)

  if(!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.'
    }
  }

  const { data } = validateFields;

  // セント単位で計算する
  const  amountInCents = data.amount * 100;

  try {
    // 特定のテーブル(idから見つける)の更新を行う
    await sql`
      UPDATE invoices
      SET customer_id = ${data.customerId}, amount = ${amountInCents}, status = ${data.status}
      WHERE id = ${id}
    `;
  } catch (e) {
    return {
      message: 'Database Error: Failed to Update Invoice.'
    }
  }

  // キャッシュクリアして、サーバーに新しくリクエストを作成
  revalidatePath('/dashboard/invoices');

  // 更新画面から一覧ページにリダイレクトをする
  redirect('/dashboard/invoices');
};

// 削除ボタンを押下したときの、データベースの更新を行う
export async function deleteInvoice (id: string) {
  // 意図的にErrorを投げる
  // throw new Error('Failed to Delete Invoice');

  try {
    await sql`
      DELETE FROM invoices
      WHERE id = ${id}
    `;

    return {
      message: 'Delete Invoice'
    }
  } catch (e) {
    return {
      message: 'Database Error: Failed to Delete Invoice.'
    }
  }

  // キャッシュクリアして、サーバーに新しくリクエストを作成
  revalidatePath('/dashboard/invoices');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', Object.fromEntries(formData))
  }
  catch (error) {
    if((error as Error).message.includes('CredentialsSignin')) {
      return 'CredentialsSignin';
    }
    throw error;
  }
}
