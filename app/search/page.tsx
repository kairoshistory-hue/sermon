import { searchItems } from "@/lib/sermonIndex";
import SearchBox from "@/components/SearchBox";

export const metadata = { title: "찾기 · Yongin Onnuri Church Sermon" };

export default function SearchPage() {
  return (<><h2 className="pagehead">설교 찾기</h2><SearchBox items={searchItems()} /></>);
}
