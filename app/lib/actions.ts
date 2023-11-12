// use serverとすることで、このファイルでexportされた関数は全てサーバー関数として扱われる。
// 今回はファイルで指定しているが、関数の中でuse serverと記述するとその関数のみサーバー関数として利用することができる。
'use server';

export async function createInvoice(formData: FormData) {
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')
  }

  // ログを確認する
  console.log(rawFormData);

  // 多くのフォームデータを持つ場合は、submitで送られてきたデータを回して、自動でobjectを生成する以下の方法の方が良い。
  // const rawFormDataTest = Object.fromEntries(formData.entries())
  // console.log(rawFormDataTest);
}
