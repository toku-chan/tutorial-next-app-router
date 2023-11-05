/**
 * tailwindでのnext/fontの追加方法はわかったけど、cssモジュールの時ってどうするんだろう？
 * ↓
 * 同じように指定して、layout.tsxなどで設定すれば良いのか。そうすれば、そのファイルにスコープしたfontが指定できるのか。
 */

import {
  Inter,
  Lusitana
} from "next/font/google";

export const inter = Inter({ subsets: ['latin'] });
export const lusitana = Lusitana({
  weight: "400",
  subsets: ['latin'],
})