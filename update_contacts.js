import * as xlsx from 'xlsx';
import * as fs from 'fs';

const data = [
  { email: 'abdurrauf.sakenov@proton.me', name: 'Abdurrauf', company: 'Narxoz' },
  { email: 'abdurrauf.sakenov@narxoz.kz', name: 'Abdurrauf Sakenov', company: 'Narxoz University' },
  { email: 'misterfighter1990@gmail.com', name: 'Fighter', company: 'Fight Club' }
];

const ws = xlsx.utils.json_to_sheet(data);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, "Contacts");

xlsx.writeFile(wb, "test_contacts.xlsx");
console.log("Successfully updated test_contacts.xlsx with the new real emails!");
