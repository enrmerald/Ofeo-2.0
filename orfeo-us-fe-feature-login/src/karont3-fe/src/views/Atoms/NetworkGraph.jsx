/*
NetworkGraph Component
--------------------------

Parameters:
  - title -> The title of the graph.
  - idComp -> The id of the component.
  - dataGraph -> A dictionary passed with the data, if we don´t need to retreive the data from server. The dictionary must have a structure with the keys 'data', 'links', 'categories'.
  - credentials: Credentials to send to the server if we need to get the data from the server.
  - route: The route to get the data.

The behaviour of the component is:
  - We can drag the network scene.
  - We can make zoom with the mouse wheel.
  - We can open a context menu with a right click on a node. This context menu is in progress, but it will show a list of options:
      - Option1: Open a new graph with the selected node as root node.
      - Option2: Open the table data of the selected node.
*/
import React, { useEffect, useState, useRef } from 'react'
import * as echarts from 'echarts'
import imgChannel from './../../static/images/icons/channel.svg'
import imgOrganization from './../../static/images/icons/organization.svg'
import imgPerson from './../../static/images/icons/person.svg'
import imgEntity from './../../static/images/icons/entity.svg'
import imgDiscovery from './../../static/images/icons/discovery.svg'
import imgLeak from './../../static/images/icons/leak.svg'

// The svg icons in path format
const icons = {
  channelPath: "image://" + imgChannel,
  organizationPath: "image://" + imgOrganization,
  personPath: "image://" + imgPerson,
  entityPath: "image://" + imgEntity,
  discoveryPath: "image://" + imgDiscovery,
  leakPath: "image://" + imgLeak
}


// Function to convert the symbol string name to the svg path value
function dataWithIcon(dataReceived) {
  dataReceived.forEach((d) => {
    d.symbol = icons[d.symbol] || d.symbol
  })
  return dataReceived
}


// Component constant
const NetworkGraph = ({ title = "Network map", idComp = "network-graph", dataGraph = null, credentials, route, width = "100%", height = "500px", setTableData = null }) => {
  const chartRef = useRef(null);
  const [recarga, setRecarga] = useState(1)



  // Variable to contain the context menu. It serves to control the menu on screen, assign and remove.
  var menu = null

  // Empty node objet to use like a secure and avoid errors with empty data.
  const emptyNode = { data: [], links: [], categories: [] }

  // DataNode state with the data to represent in the graph.
  const [dataNodes, setDataNodes] = useState(null)



  // In addition to the graph, we must include a navigable route that helps us go back.
  // The variable breadPath will be an array based in the nodeId of the parent elements, being the first index the root node.
  let breadPath = []


  // Method to pass a list item with a child into the menu
  const newListItem = (item) => {
    const rootOption = document.createElement('li')
    rootOption.appendChild(item)
    menu.querySelector("ul").appendChild(rootOption)
  }

  // Function to load a new datagraph getting a new root based on a selected node.
  const reloadRoot = (newRoot) => {
    breadPath.push({ name: newRoot.name, nodeId: newRoot.nodeId })
    credentials.data = breadPath
    RequestServer(route, "POST", credentials, (dataLoaded) => {
      if (setTableData != null) setTableData(newRoot.name, breadPath)
      setDataNodes(dataLoaded.data)
    }) // Updated data
  }

  const newRoot = (newData) => {
    // Option to new child as root
    const menuSourceButton = document.createElement('button')
    menuSourceButton.textContent = 'Abrir nodo como raíz.'
    // Functionality of the root source function
    menuSourceButton.onclick = () => reloadRoot(newData)
    return menuSourceButton
  }

  // Function to create a button that can redirect to the node tabla data
  const tableElement = (nodeData) => {
    const tableOption = document.createElement("button")
    tableOption.textContent = "View table"
    tableOption.onclick = () => {
      setTableData(nodeData.name, nodeData.nodeId)
    }
    return tableOption
  }

  // If we don't have data passed, we get it from the server.
  if (dataNodes == null) {
    if (dataGraph == emptyNode || dataGraph == null) {
      RequestServer(route, "GET", credentials, (dataLoaded) => {
        setDataNodes(dataLoaded.data)
      }) // First Load
    } else {
      setDataNodes(dataGraph)
    }
  } else if (dataNodes.breadPath) {
    breadPath = dataNodes.breadPath
  }

  if (dataNodes != null) {
    const data = dataNodes
    // Pass an arrow and put it at the end, not in the origin.
    data.links.forEach((l) => {
      // Line Syle. Availiable type options: solid, dashed or dotted.
      const lineType = l.bridge ? "dotted" : "solid"
      l.lineStyle = { width: l.width || 2, color: l.color || 'rgba(255,0,0,0.7)', type: lineType, zindex: 0 }
      // Making emphasis on the line, the selected element will be the only that shows without transparency.
      l.emphasis = {
        focus: 'adjacency',
        lineStyle: {
          width: 3, color: "rgba(255,0,0,0.9)",
        }
      }
      // Give the symbol and text position.
      l.symbol = ["none", "arrow"]
      l.position = ["50%", "50%"]
    })
  }
  const theme =
  localStorage.getItem("data-theme")

  useEffect(() => {
    const data = dataNodes || emptyNode // If we don't have data in dataNodes, load an empty node to avoid errors.
    // Give to the link the format to show.
    data.links.forEach((l) => {
      l.label = { show: true, position: "middle", formatter: "{c}" }
    })

    // We need convert SVG icons to path data.
    const updatedData = dataWithIcon(data.data)

    // Graph config.
    const option = {
      toolbox: {
        show: false,
        feature: {
          // saveAsImage: { show: false },  // Example of menu options in toolbox.
        },
      },
      series: [
        {
          roam: true,
          type: 'graph',
          layout: 'force',
          initLayout: false,
          layoutAnimation: false,
          friction: 100,
          force: {
            animationDuration: 0,
            position: "circular",
            repulsion: 1000,
            edgeLength: 200, // Links length.
          },
          label: {
            show: true,
            formatter: '{b}',
            position: "bottom",
            top: "10px",
            color: theme == "dark"? "white":"black"

          },
          categories: data.categories,
          data: updatedData,
          links: data.links,
          symbolSize: [32, 32], // Size of the icon element.
          itemStyle: {
            type: "solid"
            
          },
        },
      ],
    }


    // Retreive the DOM element of the container.
    const chartContainer = document.getElementById(idComp)

    if (chartContainer) {
      const chart = echarts.init(chartContainer)
      chart.setOption(option)

      // Give the context menu functionality.
      chart.on('contextmenu', function (params) {
        if (params.dataType === 'node') {
          // Remove the default behaviour.        
          params.event.event.preventDefault()

          // If exist a menu object, we remove it.
          if (menu) {
            chartContainer.removeChild(menu)
            menu = null
          }

          // Capture the mouse coordinates.
          const ofx = params.event.offsetX + 50 // +50 because we don't want to tap the object.
          const ofy = params.event.offsetY

          // Create a menu with options.
          menu = document.createElement('div')
          menu.innerHTML = `
            <p style='font-weight: bold;'>${params.data.name}</p>
            <ul>
            </ul>
            `

          // Pass the items to the menu. The selection of a new root and the node table (in progress)
          newListItem(newRoot(params.data))
          newListItem(tableElement(params.data))

          //Style and position to the context menu:
          menu.classList.add("z-3") // zindex bootstrap.
          menu.classList.add('shadow')
          menu.style.position = 'absolute'
          menu.style.left = ofx + "px"
          menu.style.top = ofy + "px"
          menu.style.background = '#fff'
          menu.style.border = '1px solid #ccc'
          menu.style.padding = '5px'

          // Pass the menu to the DOM element of the graph.
          chartContainer.appendChild(menu)

          // Get the control of the right click event on the menu. By now only needed to remove the context menu.
          menu.addEventListener('click', function (event) {
            // Remove menu after use it.
            chartContainer.removeChild(menu)
            menu = null
          })

          // When we end the action returns true.
          return true
        }
      })

      // Getting control of the click event. If exists a menu, and the click is not in it, we must remove it.
      chartContainer.addEventListener('click', (clickEvent) => {
        if (menu && !menu.contains(clickEvent.target)) {
          chartContainer.removeChild(menu)
          menu = null
        }
      })
    }

    // Get get the id of the breadPath container.
    const breadPathContainer = document.querySelector('#breadPath');
    // We pass the sequence to the document with navigable links.
    breadPathContainer.innerHTML = ""
    breadPath.forEach((n) => {
      let breadButton = document.createElement('button')
      breadButton.classList.add("breadButton")
      breadButton.innerText = n.name
      let divisor = document.createElement('span')
      divisor.innerHTML = " / "
      breadPathContainer.appendChild(divisor)
      let backRoute = []

      breadButton.addEventListener('click', () => {
        backRoute = [] // Clean the array for the new button data
        let check = false // Same with the check to exit loop

        for (var i = 0; i < breadPath.length && !check; i++) {
          backRoute.push(breadPath[i])

          if (n.nodeId == breadPath[i].nodeId) {
            check = true;
            credentials.data = backRoute // Update the data to send to the server
            RequestServer(route, "GET", credentials, (dataLoaded) => {
              setDataNodes(dataLoaded.data)
            })
          }
        }
      })
      breadPathContainer.appendChild(breadButton)
    })

    const reloadMap = (chart) => {
      setRecarga(recarga + 1);
    };

    window.addEventListener('resize', reloadMap)

    // Limpiar el evento de escucha cuando el componente se desmonta
    return () => {
      window.removeEventListener('resize', reloadMap);
    };


  }, [dataNodes, recarga]) // End of the useEffect.

  // returns the element.
  return (
    <>
      <div className='d-flex justify-content-width breadcrumbs'>
        <span className="network-span">Bread Crumb</span>
        <p id="breadPath"></p>
      </div>

      <div className="ewala-container ewala-networkmap" style={{ width: '100%', height: height }}>
        <div className="" style={{ position: "relative" }}>


          <div id={idComp} style={{ width: '100%', height: addPixels(height, -110), position: "absolute" }} />
        </div>
      </div>
    </>
  )
}

export default NetworkGraph
