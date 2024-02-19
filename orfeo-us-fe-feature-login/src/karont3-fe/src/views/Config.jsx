import React, { useEffect, useState } from "react";
import { UseUser } from "../auth/UserAuth";
import { Checkbox } from "./Atoms/Checkbox";
import ColorPicker from "./Atoms/ColorPicker";
import { SwitchButton } from './Atoms/Switch';
import { DataTab } from "./Atoms/Tab";

// Function to transform data format
function transformData(data) {
  /* Function to transform data format
  params: 
  - data 
      (format - key (name) : value (true = selected/ false = not selected)
        example:  "counters": {
            "channels": true,
            "organizations": true,
            "persons": true,
            "entities": false,
            "discoveries": true}
      )
  returns: (
            {id: 'channels', name: 'Channels', selected: true}
            {id: 'organizations', name: 'Organizations', selected: true}
            {id: 'persons', name: 'Persons', selected: true}
            {id: 'entities', name: 'Entities', selected: false}
            {id: 'discoveries', name: 'Discoveries', selected: true}
            )
*/
  return Object.keys(data).map((elementId) => ({
    id: elementId,
    name: elementId.charAt(0).toUpperCase() + elementId.slice(1),
    selected: data[elementId],
  }));
}
// Function to obtain selected IDs
function getIdsSelected(data) {
  /* Function to transform data (inverse of transformData) 
      params: 
    - data 
      
        example:  (
            {id: 'channels', name: 'Channels', selected: true}
            {id: 'organizations', name: 'Organizations', selected: true}
            {id: 'persons', name: 'Persons', selected: true}
            {id: 'entities', name: 'Entities', selected: false}
            {id: 'discoveries', name: 'Discoveries', selected: true}
            )
      )
    returns: (
            "counters": {
            "channels": true,
            "organizations": true,
            "persons": true,
            "entities": false,
            "discoveries": true}
            )
*/
  return data.reduce((acc, item) => {
    acc[item.id] = item.selected;
    return acc;
  }, {});
}
// Function to transform colors to default JSON format
const transformColorsToJSONFormat = () => {
  /* Obtains a copy of the colors defined for the user for both themes.
    (format: {"text-color":"#15040E","back-content-color":"#FFFFFF",...})

    Returns a json incluying both themes.
    (format: {"text-color": ["valor_for_light_theme", "value_for_dark_theme"]})
 */
  // Get the updated color values ​​and transform them to JSON format
  const lightColors = JSON.parse(localStorage.getItem('updatedLightColors'));
  const darkColors = JSON.parse(localStorage.getItem('updatedDarkColors'));

  // Check is exists
  if (!lightColors || !darkColors) {
    console.error('Colors not found.');
    return null;
  }
  // Get color keys (variable name)
  const colorLabels = Object.keys(lightColors);

  // Get transformed object
  const transformedColors = colorLabels.reduce((result, label) => {

    result[label] = [lightColors[label], darkColors[label]];
    return result;
  }, {});

  return transformedColors;
};

// Function to apply updated colors

// Execute the function
applyColors();

/* React Component */
export const Config = ({ token = "123456" }) => {

  // Credenciales para poder entrar
  const creds = {
    security: {
      token: token || localStorage.token,
    },
  };

  // Data State
  const [data, setData] = useState({}); // Loaded data 
  const [dataDisplay, setDataDisplay] = useState({}); // Loaded data - display
  const [dataCounters, setdataCounters] = useState([]);// Loaded data - display - counters
  const [selectedCounters, setSelectedCounters] = useState([]);
  const [selectedFreeSources, setSelectedFreeSources] = useState([]);
  const [selectedPaidSources, setSelectedPaidSources] = useState([]);
  const [selectedGeneral, setSelectedGeneral] = useState([]);

  const [colorsList, setColorsList] = useState([]);
  const [fontList, setFontList] = useState([]);
  const [fontFamily, setFontFamily] = useState("Space Mono, monospace")

  const [selectedLogoName, setSelectedLogoName] = useState("")
  const [defaultLogo, setDefaultLogo] = useState("")
  const [titleFontSize, setTitleFontSize] = useState('');
  const [normalFontSize, setNormalFontSize] = useState('')
  const [isChecked, setIsChecked] = useState(true);

  /* Settings route */
  const route = `http://localhost:5000/settings/${token}/`;

  useEffect(() => {
    if (localStorage.getItem('userLightColors') && localStorage.getItem('userDarkColors')) {
      localStorage.setItem('updatedLightColors', localStorage.getItem('userLightColors'))
      localStorage.setItem('updatedDarkColors', localStorage.getItem('userDarkColors'))
    }
    // Getting data server
    const response = RequestServer(route, "GET", creds, (loadedData) => {
      setTimeout(2000)
      setData(loadedData.data);
      if (!response) {
        console.log("No hay respuesta");
      }

      /* Data SOURCES */
      // const dataSources = loadedData.sources;
      // const transformedFreeSources = transformData(dataSources.free);
      // setSelectedFreeSources(transformedFreeSources);
      // const transformedPaidSources = transformData(dataSources.paid);
      // setSelectedPaidSources(transformedPaidSources);
      /* Data GENERAL */
      // const dataGeneral = loadedData.general;
      // const transformedGeneral = transformData(dataGeneral);
      // setSelectedGeneral(transformedGeneral)

      /* Data DISPLAY */
      const dataDisplay = loadedData.display;

      setDataDisplay(dataDisplay);
      setDefaultLogo(dataDisplay.logo)

      // THEME
      let defaultColors = '';
      let themeIndex = 0;

      /** Displaying colors**/
      if (localStorage.getItem("userLightColors") && localStorage.getItem("data-theme") === 'light') {
        defaultColors = JSON.parse(localStorage.getItem("userLightColors"));
        themeIndex = 0;

      } else if (localStorage.getItem("userDarkColors") && localStorage.getItem("data-theme") === 'dark') {
        defaultColors = JSON.parse(localStorage.getItem("userDarkColors"))
        themeIndex = 1;

      }
      const colorsList = Object.keys(defaultColors).map((label) => ({
        label: label,
        value: defaultColors[label],
        themeIndex: themeIndex,
      }));
      setColorsList(colorsList);
      console.log(colorsList)

      /** Displaying font **/
      const defaultFonts = dataDisplay.font;
      setNormalFontSize(defaultFonts["font-size-medium"])
      setTitleFontSize(defaultFonts["font-size-extra-large"])
      const fontList = Object.keys(defaultFonts).map((label) => ({
        label,
        value: defaultFonts[label],
      }));
      setFontList(fontList);
      console.log(fontList)

      const dataCounters = loadedData.display.counters;
      const transformedDataCounters = transformData(dataCounters);
      setdataCounters(transformedDataCounters);
      setSelectedCounters(transformedDataCounters)
    });
  }, []);

  const handleColorChange = (event, label) => {
    const updatedColors = colorsList.map((color) =>
      color.label === label ? { ...color, value: event.target.value } : color
    );

    // Asignar el estilo (para visualizar)
    // document.documentElement.style.setProperty(`--${label}`, `${event.target.value}`)
    setColorsList(updatedColors);

    const themeIndex = localStorage.getItem("data-theme") === 'light' ? 0 : 1;

    if (themeIndex !== undefined) {
      const themeColors = localStorage.getItem(`updated${themeIndex === 0 ? 'Light' : 'Dark'}Colors`);
      const parsedThemeColors = themeColors ? JSON.parse(themeColors) : {};
      parsedThemeColors[label] = event.target.value;

      localStorage.setItem(`updated${themeIndex === 0 ? 'Light' : 'Dark'}Colors`, JSON.stringify(parsedThemeColors));
    }
  };
  const handleFontFamilyChange = (event) => {
    console.log(event.target.value)
    setFontFamily(event.target.value);
  };

  /* Handle to change the logo   */
  const handleFileChange = (event) => {
    // Get the uploaded file 
    const file = event.target.files[0];
    // If exists, create a FileReader instance to read content
    if (file) {
      const reader = new FileReader();
      // Read the instance and create an image
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;

        // Define validation of dimensions
        img.onload = () => {
          const maxWidth = 250;
          const maxHeight = 100;

          // If not validated
          if (img.width > maxWidth || img.height > maxHeight) {
            alert(`The image must have a maximum size of ${maxWidth}x${maxHeight} pixels.`);
            event.target.value = "";
          } else {
            // If validated, set url logo state
            const fileUrl = e.target.result;
            setSelectedLogoName(fileUrl);
          }
        };
      };

      reader.readAsDataURL(file);
    } else {
      // No new file selected, include the default logo in the JSON payload
      setSelectedLogoName("src/static/images/ewalaSombrero.png");
    }
  };

  // Handle Switch (theme) hcange
  const handleToggle = (value) => {
    setIsChecked(value);
  };

  // Handle Checkbox (counters) change
  const handleCheckboxChange = (updatedCounters) => {
    setSelectedCounters(updatedCounters);
  };
  const handleNormalFontSize = (event) => {
    setNormalFontSize(event.target.value);

  }
  const handleTitleFontSize = (event) => {
    setTitleFontSize(event.target.value);

  }
  const transformFonts = {
    "font-name": fontFamily,
    "font-size-medium": normalFontSize,
    "font-size-extra-large": titleFontSize
  }
  /* SOOURCE CONTENT */
  // const sourceContent = (
  //   <>
  //     {/* Free Sources */}
  //     <div className="freeSourceDiv">
  //       <h5> Free Sources</h5>
  //       <Checkbox
  //         id="config-freeSources"
  //         labels={selectedFreeSources}
  //         type="checkbox"
  //         onUpdate={(updatedLabels) => handleCheckboxChange(updatedLabels)}
  //       ></Checkbox>
  //     </div>
  //     <br />
  //     {/* Paid Sources */}
  //     <div className="paidSourceDiv">
  //       <h5>Paid Sources</h5>
  //       <Checkbox id="config-paidSources"
  //         type="checkbox"
  //         labels={selectedPaidSources}
  //         onUpdate={(updatedLabels) => handleCheckboxChange(updatedLabels)}></Checkbox>
  //     </div>
  //   </>
  // );
  /* GENERAL CONTENT */
  // const generalContent = [
  //   <h5> Información general</h5>,
  //   <Checkbox id="config-general"
  //     type="checkbox"
  //     labels={selectedGeneral}
  //     onUpdate={(updatedLabels) => handleCheckboxChange(updatedLabels)}></Checkbox>
  // ];
  const styleContent = (<>
    {/* Color palette block */}
    <div className="colorDiv">
      <h5>Palette theme</h5>
      <div className="colorGrid ">
        <ColorPicker colors={colorsList} onChange={handleColorChange} />
      </div>
    </div>
    <br />

    {/* Fontsize block */}
    <div className="fontDiv">
      <h5>Font style</h5>
      <h6>Select Font Family</h6>
      <div className="fontFamily-selector">
        <select name="fontFamilySelector" id="fontFamilySelector" onChange={handleFontFamilyChange} value={fontFamily}>
          <option value={fontFamily} style={{ fontFamily: { fontFamily } }}>{fontFamily.split(',')[0]}</option>
          <option value="Robotika" style={{ fontFamily: 'Robotika' }}>Robotika</option>
          <option value="AstroSpace" style={{ fontFamily: 'AstroSpace' }}>AstroSpace</option>
        </select>

      </div><br />
      <h5 style={{ fontFamily: fontFamily, textAlign: "center" }}>Selected Font: {fontFamily.split(',')[0]}</h5>

      <br />
      <h6>Select Normal Font Size</h6>
      <div className="normal-fontSize">
        <input type="range" min="10" max="20" value={`${normalFontSize}px`} onChange={handleNormalFontSize} />
        <output>{normalFontSize}</output>
      </div>
      <br />
      <h6>Select Title Font Size</h6>
      <div className="normal-fontSize">
        <input type="range" min="10" max="20" value={`${titleFontSize}px`} onChange={handleTitleFontSize} />
        <output>{titleFontSize}</output>
      </div>
    </div>
    <br />
  </>);


  /* DISPLAY CONTENT */
  const displayContent = (
    <>
      {/* Logo block */}
      <div className="logoDiv">
        <img src={dataDisplay.logo} alt="Ewala Sombrero" /> <br />
        <input type="file" onChange={handleFileChange} accept=".jpg, .jpeg, .png" />
      </div><br />


      {/* Counters block */}
      <div className="viewDiv">
        <h5>Counters</h5>
        <p>Select four of the next counters:</p>
        <Checkbox
          id="view-countersDisplay"
          labels={dataCounters}
          type="checkbox"
          onUpdate={(updatedLabels) => handleCheckboxChange(updatedLabels)}
        />
      </div>
      <br />
      {/* Switch Theme block */}
      <div className="themeDiv">
        <h5>System theme</h5>
        <br />
        <SwitchButton id="themeSlider" left="Light Mode" right="Dark Mode" isChecked={isChecked} onToggle={handleToggle} />
      </div>
    </>
  );

  /* TAB CONTENT
    For each tab defines the id, title, content and icon
  */
  const dataTabList = [
    // {
    //   id: "sources",
    //   title: "Sources",
    //   content: sourceContent,
    //   img: "fa-screwdriver-wrench",
    // },
    // {
    //   id: "general",
    //   title: "General",
    //   content: generalContent,
    //   img: "fa-toolbox",
    // },
    {
      id: "display",
      title: "Display",
      content: displayContent,
      img: "fa-pen-to-square",
    },
    {
      id: "style",
      title: "Style",
      content: styleContent,
      img: "fa-pen-to-square",
    },
  ];
  const UserId = UseUser().UserId;

  /* Handle Save -- 
  send the user settings JSON to server - the format must be the same as deffaultSettings.json (server)
  */
  console.log(dataDisplay.font);
  const handleSave = async () => {
    console.log('Saving data');

    // JSON sended
    const updatedSettings = {
      display: {
        logo: selectedLogoName !== '' ? selectedLogoName : defaultLogo,
        colors: transformColorsToJSONFormat(colorsList),
        font: transformFonts,
        counters: {
          channels: selectedCounters.find((counter) => counter.id === 'channels')?.selected ?? false,
          organizations: selectedCounters.find((counter) => counter.id === 'organizations')?.selected ?? false,
          persons: selectedCounters.find((counter) => counter.id === 'persons')?.selected ?? false,
          entities: selectedCounters.find((counter) => counter.id === 'entities')?.selected ?? false,
          discoveries: selectedCounters.find((counter) => counter.id === 'discoveries')?.selected ?? false,
        },
        theme: localStorage.getItem("data-theme")
      },
      sources: {
        free: getIdsSelected(selectedFreeSources),
        paid: getIdsSelected(selectedPaidSources),
      },
      general: {},
    };

    if (!UserId) {
      console.log("UserId not available");
      return;
    }

    try {
      RequestServer(route, "POST", updatedSettings, () => {
        console.log("Data posted");
      });

      // Wait 2s before reloading 
      setTimeout(() => {
        localStorage.removeItem("updatedLightColors");
        localStorage.removeItem("updatedDarkColors");
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error during POST:', error);
    }
  };

  /* Handle Cancel --
      removes the local variables of the updated colors and returns to the beginning
   */
  const handleCancel = () => {
    console.log('Cancel changes');
    localStorage.removeItem('updatedLightColors')
    localStorage.removeItem('updatedDarkColors')
    window.location.href = "/";
  };

  /* Handle Reset - 
  removes the "settings" field from the user database  
  */
  const handleReset = () => {
    console.log('Reset data');
    try {
      RequestServer(route, "DELETE", creds, () => {
        console.log("Settings deleted");
      });
      window.location.reload();


    } catch (error) {
      console.error('Error during GET:', error);
    }
  };

  // Returns the rendered tab
  return (
    <div className="config-container">
      <DataTab id="configTab" tabs={dataTabList}></DataTab>
      <div className="config-btn-group">
        <button className="btn config-item-button" id="config-save" type="submit" onClick={handleSave}>Save</button>
        <button className="btn config-item-button" id="config-cancel" type="submit" onClick={handleCancel}>Cancel</button>
        <button className="btn config-item-button" id="config-reset" type="submit" onClick={handleReset}>Reset settings</button>
      </div>
    </div>
  );
};
