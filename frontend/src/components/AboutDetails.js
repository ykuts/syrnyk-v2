import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
//import data from "../data/about.json";
import About1 from "./pages/About1";
import About2 from "./pages/About2";
import About3 from "./pages/About3";
import About4 from "./pages/About4";
import About5 from "./pages/About5";
import About6 from "./pages/About6";

const AboutDetails = () => {
    const { id } = useParams()

    return ( 
        <div>
            {/* <div>
            About details - {id}
            </div> */}
            <div className="text">
                {/* {console.log(data.filter((about => about.id === parseInt(id))))}
                {data.filter((about => about.id === parseInt(id)))
                .map(item => item.details)} */}
                {id === "1" && <About1 />}
                {id === "2" && <About2 />}
                {id === "3" && <About3 />}
                {id === "4" && <About4 />}
                {id === "5" && <About5 />}
                {id === "6" && <About6 />}

            </div>
            <div>
            <Link to="/">Back to homepage</Link>
            </div>
        </div>
     );
}
 
export default AboutDetails;