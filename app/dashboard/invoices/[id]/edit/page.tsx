import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers, fetchInvoiceById } from '@/app/lib/data';

type Props = {
  params: {
    id: string
  }
}

export default async function Page({
  params
}: Props) {

  // ダイナミックルートで指定された、動的に変更される[id]の値を取得する
  // console.log(params);
  const { id } = params;

  // fetchInvoiceById と fetchCustomers を並列で取得する
  const [ invoice, customers ] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers()
  ]);
  // console.log(invoice)
  // console.log(customers)

  // undefinedの検証をしていないため、propsを渡すときに型違いでエラーが発生する
  // 暫定的に検証し、undefinedだったら、nullを返すことにする
  if(!invoice) return null;

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}