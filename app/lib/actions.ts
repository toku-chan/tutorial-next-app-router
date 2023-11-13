// use serverとすることで、このファイルでexportされた関数は全てサーバー関数として扱われる。
// 今回はファイルで指定しているが、関数の中でuse serverと記述するとその関数のみサーバー関数として利用することができる。
'use server';

import { sql } from "@vercel/postgres";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string()
});

// 請求書を作成するときのフォーム型
// idとdateは除外している
const CreateInvoice = InvoiceSchema.omit({
  id: true,
  date: true
});

export async function createInvoice(formData: FormData) {
  // 多くのフォームデータを持つ場合は、submitで送られてきたデータを回して、自動でobjectを生成する以下の方法の方が良い。
  // const rawFormDataTest = Object.fromEntries(formData.entries())
  // console.log(rawFormDataTest);

  const {
    customerId,
    amount,
    status
  } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  });

  // セント単位で計算する
  const  amountInCents = amount * 100;

  // invoiceの作成日を作成する
  const date = new Date().toISOString().split('T')[0];

  // SQLクエリを作成
  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

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

export async function updateInvoice(id: string, formData: FormData) {
  const {
    customerId,
    amount,
    status
  } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  });

  // セント単位で計算する
  const  amountInCents = amount * 100;

  // 特定のテーブル(idから見つける)の更新を行う
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amount}, status = ${status}
    WHERE id = ${id}
  `;

  // キャッシュクリアして、サーバーに新しくリクエストを作成
  revalidatePath('/dashboard/invoices');

  // 更新画面から一覧ページにリダイレクトをする
  redirect('/dashboard/invoices');
};

// 削除ボタンを押下したときの、データベースの更新を行う
export async function deleteInvoice (id: string) {
  await sql`
    DELETE FROM invoices
    WHERE id = ${id}
  `;

  // キャッシュクリアして、サーバーに新しくリクエストを作成
  revalidatePath('/dashboard/invoices');
}
