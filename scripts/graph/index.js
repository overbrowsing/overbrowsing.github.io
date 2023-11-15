fetch('cache/data.json')
.then(res => res.json())
.then(data => {
  const restructuredData = {
    id: 'Overbrowsing',
    children: [],
  };

  // Group items by category
  const groupedByCategory = {};
  data.forEach(categoryNode => {
    const category = categoryNode.category || 'Uncategorized'; // Use "Uncategorized" if category is not available
    if (!groupedByCategory[category]) {
      groupedByCategory[category] = [];
    }
    groupedByCategory[category].push(categoryNode);
  });

  // Create nodes for each category and add items as children
  for (const [category, items] of Object.entries(groupedByCategory)) {
    const categoryNode = {
      id: category.replace(/\s+/g, '-'), // Replace spaces with hyphens for valid IDs
      children: items,
    };
    restructuredData.children.push(categoryNode);
  }

  const setAllNodesCollapsed = (node) => {
    node.collapsed = true;
    node.children && node.children.forEach(setAllNodesCollapsed);
  };

  setAllNodesCollapsed(restructuredData);

    const container = document.createElement('div');
    document.body.appendChild(container);

    // Create a 'popup' div element
    const popup = document.createElement('div');
    popup.id = 'pop-up';
    popup.style.display = 'none'; // Hide it initially
    popup.style.position = 'absolute'; // Set position as absolute
    popup.style.backgroundColor = 'white';
    popup.style.padding = '10px';
    container.appendChild(popup);

    const graph = new G6.TreeGraph({
      container: container,
      width: window.innerWidth, // Increase the width for higher resolution
      height: window.innerHeight, // Increase the height for higher resolution
      pixelRatio: window.devicePixelRatio * 2 || 1, // Set pixelRatio with a multiplier
      modes: {
        default: [
          'collapse-expand',
          'drag-canvas',
          {
            type: 'click-node',
            onClick: (ev) => {
              const node = ev.item.get('model');
              if (!node.children || node.children.length === 0) {
                // Populate the 'pop-up' div with node information
                popup.innerHTML = `
                  <p>${node.title}</p>
                  <p>Description: ${node.description || 'N/A'}</p>
                  <p>URL: <a href="${node.url}" target="_blank">${node.url || 'N/A'}</a></p>
                `;
                popup.style.display = 'block'; // Show the pop-up
              }
            },
          },
        ],
      },
      defaultNode: {
        style: {
          fill: '#272A24',
          stroke: '#ABB193',
          lineWidth: 1,
          cursor: 'pointer',
        },
      },
      defaultEdge: {
        style: {
          stroke: '#ABB193',
          lineWidth: 1,
          lineDash: [2, 4],
        },
      },
      layout: {
        type: 'dendrogram',
        direction: 'LR',
        nodeSep: 10,
        rankSep: 160,
        radial: true,
      },
    });

    graph.node(node => {
      const childrenCount = node.children ? node.children.length : 0;
      // TODO: turn back on when QA is done
      // const nodeSize = 30 + childrenCount * 12; // Increase the default size by 30%
      const nodeSize = 50; // Increase the default size by 30%
      const isLeaf = !node.children || node.children.length === 0;

      const label = isLeaf ? node.title : `${node.id} · ${childrenCount}`;
      const media = node.media ? node.media : '';

      if (node.new) {
        return {
          labelCfg: {
            style: {
              fill: '#ABB193',
              fontSize: 12,
            },
            position: 'right',
          },
          size: isLeaf ? 26 : (node.isRoot ? 120 : nodeSize),
          label: `*NEW* ${media} ${label}`,
          style: {
            lineWidth: isLeaf ? 0 : 1,
          },
          url: node.url,
          description: node.description,
        };
      } else {
        return {
          labelCfg: {
            style: {
              fill: '#ABB193',
              fontSize: 12,
            },
          },
          size: isLeaf ? 26 : (node.isRoot ? 120 : nodeSize),
          label: `${media} ${label}`,
          style: {
            lineWidth: isLeaf ? 0 : 1,
          },
          url: node.url,
          description: node.description,
        };
      }
    });

    graph.data(restructuredData);
    graph.render();
    graph.fitView();
    
    window.addEventListener('resize', () => {
      graph.changeSize(window.innerWidth * 2, window.innerHeight * 2);
    });
  });