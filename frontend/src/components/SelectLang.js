import Form from 'react-bootstrap/Form';
import '../custom.scss';

function SelectLang() {
  return (
    <Form.Select aria-label="Default select example">
      <option value="ukrainian">UKR</option>
      <option value="french">FR</option>
      <option value="English">EN</option>
    </Form.Select>
  );
}

export default SelectLang;