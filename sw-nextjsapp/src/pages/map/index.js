import NavBar from 'comp/navbar';
import Map from 'comp/map';


export default function MapPage() {


    return (
        <div className="MapPage">
            <NavBar />
            <div id='map-page-container'>
                <Map/>
            </div>
        </div>
    )
}
