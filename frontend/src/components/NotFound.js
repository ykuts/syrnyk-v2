import { Link } from "react-router-dom";

const NotFound = () => {
    return ( 
        <div>
        <h2>The page not found</h2>
        <Link to="/">Back to homepage</Link>
        </div>
     );
}
 
export default NotFound;