/* Filtration Buttons */
function filtrationButtonsCreation(action) {

	const mainButtonNames = new Array("Gallery View", "Table View", "Sort by Year", "Sort by Title", "Ascending", "Descending");
	const yearOptions = new Array("View All Years");
    for (let k = 2024; k >= 1974; k--) {
        yearOptions.push(k);
    }

    //WHAT IS THIS **************************
	const categoryOptions = new Array ("View All Categories", "Courses", "Talks-Sketches", "Appy Hour", "Emerging Technologies");
	
	const allButtons = [].concat(mainButtonNames, yearOptions, categoryOptions);
  
	let container = jQuery('#filtration-buttons');
	for(const button of allButtons) {
		let btn = jQuery(document.createElement('a'));
		btn.text(button);
		btn.addClass('btn');
		btn.click(function(event) {
			jQuery(this).addClass('btn-success');
			container.children().each(function() {
				if(jQuery(this).text() != btn.text()) {
					jQuery(this).removeClass('btn-success');
				}
			});

            if(action)
                action(event, button);
		});
		container.append(btn);
	}
    return container;
}

/* Pagination */
function customPagination(pagDetails, action) {

    if(!pagDetails)
        return false;

	let totalPages = Math.ceil(pagDetails.total_items/pagDetails.limit);
	let maxPrevious = 5;
	let maxNext = 5;
	let pageNumbers = customPaginationPageNumbers(pagDetails.current_page, totalPages, maxPrevious, maxNext);
	let container = jQuery('#entry-pagination');
	// let container = jQuery('#people-summaries-pag');
	container.addClass('pods-pagination-advanced');
	container.css('color', '#2b6fce');
	container.empty();
	
	for(let page of pageNumbers) {
		
		let element = jQuery(document.createElement('a')).text(page);
		
		element.click(function(event) {
			action(event, page)
		});
		
		if(page === pagDetails.current_page)
			element.css('color', 'black');
		
		container.append(element);
		container.append('&nbsp;');
	}
	
	if(pagDetails.current_page > 1) {
		let first = jQuery(document.createElement('a')).text('« First').after(' ');
		first.click(function(event){action(event, 1)});
		let previous = jQuery(document.createElement('a')).text('‹ Previous').after(' ');
		previous.click(function(event){action(event,pagDetails.current_page-1)});
		
		container.prepend('&nbsp;');
		container.prepend(previous);
		container.prepend('&nbsp;');
		container.prepend(first);
	}
	
	if(pagDetails.current_page < totalPages) {
		let next = jQuery(document.createElement('a')).text('Next ›').after(' ');
		next.click(function(event){action(event,pagDetails.current_page+1)});
		let last = jQuery(document.createElement('a')).text('Last »').after(' ');
		last.click(function(event){action(event,totalPages)});
		
		container.append(next);
		container.append('&nbsp;');
		container.append(last);
	}
}

function customPaginationPageNumbers(currentPage, totalPages, maxPrevious, maxNext) {
	let numbers = [];
	
	for(let i=currentPage-1, j=0; i>1 && j<maxPrevious ; i--,j++) {
		numbers.unshift(i);
	}
	if(currentPage != 1)
		numbers.unshift(1);
	
	for(let i=currentPage, j=0; i<totalPages && j<maxNext ; i++,j++) {
		numbers.push(i);
	}
	
	numbers.push(totalPages);
	
	return numbers;
}
/* ============================================================
   SIGGRAPH HISTORY ARCHIVE – Filtration v0.1 (toolbar + sidebar)
   Keeps legacy #view/#sortby/#sortstyle/#year/#cat spans intact
   ============================================================ */

(function () {
  const CURRENT_CONFERENCE_YEAR = 2024;
  const FIRST_CONFERENCE_YEAR = 1974;

  const $ = window.jQuery;

  function setSpan(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function getSpan(id) {
    const el = document.getElementById(id);
    return el ? el.textContent.trim() : "";
  }

  function debounce(fn, ms) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // Initialize or re-render a Year radio facet. If `years` is provided
  // (array of numeric year strings), the facet will render only those years.
  // Otherwise it falls back to rendering the full default range.
  function initYearRadios(targetId, years) {
    const host = document.getElementById(targetId);
    if (!host) return;
    const allId = `${targetId}-all`;
    host.innerHTML = `
      <label class="sgg-radio"><input type="radio" name="${targetId}"
        id="${allId}" value="all" checked> View All</label>`;

    if (Array.isArray(years) && years.length > 0) {
      // Years provided by AJAX (expected newest-first order)
      years.forEach(y => {
        const id = `${targetId}-${y}`;
        const label = document.createElement("label");
        label.className = "sgg-radio";
        label.innerHTML = `<input type="radio" name="${targetId}" id="${id}" value="${y}"> ${y}`;
        host.appendChild(label);
      });
    } else {
      // Fallback to static full range
      for (let y = CURRENT_CONFERENCE_YEAR; y >= FIRST_CONFERENCE_YEAR; y--) {
        const id = `${targetId}-${y}`;
        const label = document.createElement("label");
        label.className = "sgg-radio";
        label.innerHTML = `<input type="radio" name="${targetId}" id="${id}" value="${y}"> ${y}`;
        host.appendChild(label);
      }
    }

    host.addEventListener("change", (e) => {
      if (e.target && e.target.matches("input[type=radio]")) {
        const v = e.target.value === "all" ? "viewall" : e.target.value;
        setSpan("year", v);
        // When year changes, go back to page 1
        if (typeof window.getEntries === "function") {
          window.getEntries({ page: 1 });
        }
      }
    });
  }

  // Fetch available years for a given category from the server and re-render
  // the year facet `targetId` (defaults to `facet-conf_year`). This keeps the
  // year list in-sync with the selected Category radio.
  function updateYearFacetForCategory(categorySlug, targetId = 'facet-conf_year') {
    if (!window.filtervars || !filtervars.ajaxurl) return;

    const podToken = document.getElementById('pod_name_container') ? document.getElementById('pod_name_container').textContent.trim() : '';
    const payload = {
      action: 'get_years_for_category',
      nonce: filtervars.nonce,
      pod_name: podToken,
      category: categorySlug || 'viewall'
    };

    jQuery.post(filtervars.ajaxurl, payload)
      .done(function(res) {
        try {
            if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
            initYearRadios(targetId, res.data);
            // Re-clamp the facet UI after re-rendering — prefer direct call when available,
            // otherwise dispatch an event that the clamp implementation will listen for.
            if (window && typeof window.clampYearFacet === 'function') {
              try { window.clampYearFacet(targetId, 6); } catch(e){}
            } else {
              try { document.dispatchEvent(new CustomEvent('year-facet-updated', { detail: { containerId: targetId, visibleCount: 6 } })); } catch(e){}
              // Retry shortly in case the listener hasn't been registered yet
              try { setTimeout(function(){ document.dispatchEvent(new CustomEvent('year-facet-updated', { detail: { containerId: targetId, visibleCount: 6 } })); }, 150); } catch(e){}
            }
          } else {
            // No server-provided years — render fallback full range
            initYearRadios(targetId);
            if (window && typeof window.clampYearFacet === 'function') {
              try { window.clampYearFacet(targetId, 6); } catch(e){}
            } else {
              try { document.dispatchEvent(new CustomEvent('year-facet-updated', { detail: { containerId: targetId, visibleCount: 6 } })); } catch(e){}
              // Retry shortly in case the listener hasn't been registered yet
              try { setTimeout(function(){ document.dispatchEvent(new CustomEvent('year-facet-updated', { detail: { containerId: targetId, visibleCount: 6 } })); }, 150); } catch(e){}
            }
          }
        } catch (ex) {
          console.warn('updateYearFacetForCategory — unexpected response', ex);
          initYearRadios(targetId);
        }
      })
      .fail(function() {
        // On fail, fall back to full range
        initYearRadios(targetId);
      });
  }

/* ============================================================
Gavin function
============================================================ */
// New part added for Category radios button
function initCategoryRadios(targetId) {
const host = document.getElementById(targetId);
if (!host) return;

// Get category options based on page content
let categoryOptions = ["View All Categories"];

// Check if this is a Learning page
const description = document.getElementById("description");
if (description && description.innerHTML.includes("Learning")) {
	// Get from WordPress taxonomy dynamically
	if (window.FiltrationTaxonomies && window.FiltrationTaxonomies.learningTypes) {
		const learningNames = window.FiltrationTaxonomies.learningTypes.map(term => term.name);
		categoryOptions = categoryOptions.concat(learningNames);
	} else {
		// Fallback to hardcoded values if taxonomy data not available
		categoryOptions = categoryOptions.concat([
			// "Art Papers and Presentations", "Business", "Co-Located Events", "Courses", 
			// "Dailies", "Diversity", "Education", "Exhibitor Sessions", "Frontiers", "Keynotes", 
			// "Panels", "Posters", "Production Sessions", "Retrospective", "Special Sessions", 
			// "Talks-Sketches", "Technical Papers", "Web Graphics",
		]);
	}
} else if (description && description.innerHTML.match(/^Experiences$/)) {
	// Get from WordPress taxonomy dynamically
	if (window.FiltrationTaxonomies && window.FiltrationTaxonomies.experienceTypes) {
		const experienceNames = window.FiltrationTaxonomies.experienceTypes.map(term => term.name);
		categoryOptions = categoryOptions.concat(experienceNames);
	} else {
		// Fallback to hardcoded values if taxonomy data not available
		// categoryOptions = categoryOptions.concat([
		// 	"ACM SIGGRAPH Village", "Appy Hour", "Birds of a Feather", "Emerging Technologies",
		// 	"Competitions", "Performances", "Games", "History", "Real-Time Live!", 
		// 	"Special Sessions", "SIGGRAPH Mobile", "SIGKids", "Labs-Studio", "VR Theater", "VR Experiences"
		// ]);
	}
} else if (description && description.innerHTML.match("Community")) {
	// Get from WordPress taxonomy dynamically
	if (window.FiltrationTaxonomies && window.FiltrationTaxonomies.communityTypes) {
		// Store both name and slug for each option
		const communityOptions = window.FiltrationTaxonomies.communityTypes.map(term => ({
			name: term.name,
			slug: term.slug
		}));
		categoryOptions = categoryOptions.concat(communityOptions);
	} else {
		// Fallback to hardcoded values if taxonomy data not available
		// categoryOptions = categoryOptions.concat([
		// 	"ACM SIGGRAPH Organization", "Chapters", "Digital Arts Community", "Education Committee", "History and Archives", "Pioneers",
		// ]);
	}
} else if (description && description.innerHTML.match("Publications")) {
	// For publications, show meta-categories instead of individual types
	categoryOptions = categoryOptions.concat([
		{ name: "Publication Type", slug: "publication-type-meta" },
		{ name: "Publication Sub-Type", slug: "publication-sub-type-meta" }
	]);
} 
else if (description && description.innerHTML.match("Awards")) {
  if (window.FiltrationTaxonomies && window.FiltrationTaxonomies.awardTypes) {
    const awardNames = window.FiltrationTaxonomies.awardTypes.map(term => term.name);
    categoryOptions = categoryOptions.concat(awardNames);
  } else {
    // Fallback to hardcoded values if taxonomy data not available
    console.warn('Award types not available from WordPress taxonomy');
  }
} else if (description && description.innerHTML.match("Collectibles")) {
  if (window.FiltrationTaxonomies && window.FiltrationTaxonomies.collectibleTypes) {
    const collectibleNames = window.FiltrationTaxonomies.collectibleTypes.map(term => term.name);
    categoryOptions = categoryOptions.concat(collectibleNames);
  } else {
    // Fallback to hardcoded values if taxonomy data not available
    console.warn('Award types not available from WordPress taxonomy');
  }
}else {
	// Default categories if no specific page type detected
	categoryOptions = categoryOptions.concat([
		"Courses", "Talks-Sketches", "Appy Hour", "Emerging Technologies"
	]);
}

// Create radio buttons
host.innerHTML = '';
categoryOptions.forEach((option, index) => {
	const label = document.createElement("label");
	label.className = "sgg-radio";
	
	// Handle both string options (legacy) and object options (with name/slug)
	let optionName, optionValue;
	if (typeof option === 'object' && option !== null) {
		// New format: object with name and slug
		optionName = option.name;
		optionValue = option.slug || option.name.toLowerCase().replace(/\s+/g, '-');
	} else {
		// Legacy format: string
		optionName = option;
		optionValue = index === 0 ? "all" : option.toLowerCase().replace(/\s+/g, '-');
	}
	
	const id = `${targetId}-${optionValue}`;
	label.innerHTML = `<input type="radio" name="${targetId}" id="${id}" value="${optionValue}" ${index === 0 ? 'checked' : ''}> ${optionName}`;
	host.appendChild(label);
});

// If on a community subcategory page, select the appropriate category radio button
if (window.location.pathname.startsWith('/community-')) {
	const path = window.location.pathname;
	let categoryValue = '';
	
	// Map URL paths to category values
	if (path.includes('/community-pioneers/')) {
		categoryValue = 'pioneers';
	} else if (path.includes('/community-acm-siggraph-organization/')) {
		categoryValue = 'acm-siggraph-organization';
	} else if (path.includes('/community-professional-and-student-chapters-committee/') || path.includes('/community-chapters/')) {
		categoryValue = 'chapters';
	} else if (path.includes('/community-digital-arts-community/')) {
		categoryValue = 'digital-arts-community';
	} else if (path.includes('/community-education-committee/')) {
		categoryValue = 'education';
	} else if (path.includes('/community-history-and-archives/')) {
		categoryValue = 'history-and-archives';
	}
	
	// If we found a matching category, select it
	if (categoryValue) {
		const categoryRadio = document.getElementById(`${targetId}-${categoryValue}`);
		if (categoryRadio) {
			categoryRadio.checked = true;
			// Also uncheck the "View All" option
			const viewAllRadio = document.getElementById(`${targetId}-all`);
			if (viewAllRadio) {
				viewAllRadio.checked = false;
			}
			// Update the cat span
			setSpan("cat", categoryValue);
		}
	}
}


host.addEventListener("change", (e) => {
  if (e.target && e.target.matches("input[type=radio]")) {
    const v = e.target.value === "all" ? "viewall" : e.target.value;
    const categoryName = e.target.parentElement.textContent.trim();
    
    // Check if we're on a Community page
    const isCommunityPage = window.location.pathname.startsWith('/community');
    
    if (isCommunityPage) {
      // COMMUNITY: Navigate to different pages (existing behavior)
      if (v !== "viewall") {
        const categorySlug = v.toLowerCase().replace(/\s+/g, '-');
        const baseUrl = window.location.origin;
        let targetUrl;
        
        let communityType = '';
        switch(v) {
          case "pioneers":
            targetUrl = `${baseUrl}/community-pioneers/`;
            communityType = 'pioneers';
            break;
          case "acm-siggraph-organization":
            targetUrl = `${baseUrl}/community-acm-siggraph-organization/`;
            communityType = 'organization';
            break;
          case "digital-arts-community":
            targetUrl = `${baseUrl}/community-digital-arts-community/`;
            communityType = 'digital-arts';
            break;
          case "education-committee":
            targetUrl = `${baseUrl}/community-education-committee/`;
            communityType = 'education-committee';
            break;
          case "history-and-archives":
            targetUrl = `${baseUrl}/community-history-and-archives/`;
            communityType = 'history';
            break;
          case "chapters":
          case "professional-and-student-chapters-committee":
            targetUrl = `${baseUrl}/community-professional-and-student-chapters-committee/`;
            communityType = 'chapters';
            break;
          default:
            targetUrl = `${baseUrl}/community-${categorySlug}/`;
            communityType = categorySlug;
        }
        window.location.href = targetUrl;
      } else {
        setSpan("cat", v);
        if (typeof window.getEntries === "function") {
          window.getEntries({ page: 1 });
        }
      }
    } else {
      // OTHER PAGES: Filter on same page + update Type facet
      setSpan("cat", v);
      // Update the Year facet to reflect this category selection
      try { updateYearFacetForCategory(v); } catch (e) { /* fail silently */ }
      
      // Clear the subcategory selection when category changes
      jQuery('#pod_sub_type_container').text("");
      
      // Populate Type facet based on selected category
      if (v !== "viewall") {
        // Get the pod_name to determine which page we're on
        const podName = jQuery('#pod_name_container').text().trim();
        
        // Check if the selected category is a community subcategory
        // Handle variations like 'education', 'education-committee', etc.
        const isCommunitySubcategory = v.includes('pioneer') || v.includes('education') || 
                                       v === 'chapters' || v === 'digital-arts' || 
                                       v === 'organization' || v === 'history' ||
                                       v === 'pioneers' || v === 'education' || v === 'education-committee';
        
         // Check if the selected category is an experience subcategory that has its own types
        const isExperienceSubcategory = v === 'competitions' || v === 'competition' ||
                                        v === 'emerging-technologies' || v === 'etech' ||
                                        v === 'games' || v === 'history' || v === 'Lab' ||
                                        v === 'performances';

        // Check if the selected category is a learning subcategory that has its own types
        const isLearningSubcategory = v === 'art-papers-and-presentations' || v === 'frontiers';
        
        // Check if the selected category is a publication meta-category
        const isPublicationMetaCategory = v === 'publication-type-meta' || v === 'publication-sub-type-meta';

        // For community subcategories, use the selected value directly
        // For other categories, use pod_name to determine Type facet category
        let categoryForTypes;
        if (isCommunitySubcategory) {
          categoryForTypes = v;
        } 
        else if (isExperienceSubcategory) {
          // For experience subcategories with their own types, use the selected value
          categoryForTypes = v;
        }
        else if(isLearningSubcategory){
          categoryForTypes = v;
          console.log('Learning subcategory selected for Type facet:', categoryForTypes);
        }
        else if (isPublicationMetaCategory) {
          // For publication meta-categories, use the selected value directly
          categoryForTypes = v;
          console.log('Publication meta-category selected for Type facet:', categoryForTypes);
        }
        else {
          categoryForTypes = podName;
          if (podName === 'publication') {
            categoryForTypes = 'publications';
          } else if (podName === 'award') {
            categoryForTypes = 'awards';
          } 
          // else if (podName === 'experience') {
          //   categoryForTypes = 'experience';
          // } 
          // else if (podName === 'learning') {
          //   categoryForTypes = 'learning';
          // }
          // If pod_name is empty or doesn't match, try using the category value as fallback
          if (!categoryForTypes || categoryForTypes === '') {
            categoryForTypes = v;
            console.log('Using category value as fallback for Type facet:', categoryForTypes);
          }
        }
        populateTypeFacet(categoryForTypes, categoryName);
      } else {
        // Hide Type facet when "View All" is selected
        const categoryTypeElement = document.getElementById("category-type");
        if (categoryTypeElement) {
          categoryTypeElement.classList.remove('show');
        }
      }
      
      // Trigger filter update
      if (typeof window.getEntries === "function") {
        window.getEntries({ page: 1 });
      }
    }
  }
});

// Function to populate Type facet based on selected category
function populateTypeFacet(categorySlug, categoryName) {
  console.log('Populating Type facet for category:', categorySlug, categoryName);
  
  const facetBody = document.getElementById("facet-type");
  if (!facetBody) {
    console.warn('facet-type body not found');
    return;
  }
  
  // Clear existing content
  facetBody.innerHTML = '';
  
  // Map category names to their taxonomy data and radio button names
  const categoryDataMap = {
    'learning': {
      data: window.FiltrationTaxonomies?.learningTypes || [],
      radioName: 'learning-subcategory'
    },
    'experiences': {
      data: window.FiltrationTaxonomies?.experienceTypes || [],
      radioName: 'experience-subcategory'
    },
    'experience': {
      data: window.FiltrationTaxonomies?.experienceTypes || [],
      radioName: 'experience-subcategory'
    },
    'publications': {
      data: window.FiltrationTaxonomies?.publicationTypes || [],
      radioName: 'publications-subcategory'
    },
    'publication-type-meta': {
      data: window.FiltrationTaxonomies?.publicationTypes || [],
      radioName: 'publication-type-subcategory'
    },
    'publication-sub-type-meta': {
      data: window.FiltrationTaxonomies?.publicationSubTypes || [],
      radioName: 'publication-subtype-subcategory'
    },
    'awards': {
      data: window.FiltrationTaxonomies?.awardTypes || [],
      radioName: 'awards-subcategory'
    },
    'community': {
      data: window.FiltrationTaxonomies?.communityTypes || [],
      radioName: 'community-subcategory'
    }
  };
  
  // Map community subcategory values to their specific taxonomy data
  // Note: The category value comes from the taxonomy term slug (e.g., "education", "pioneers")
  // Both pioneers and education should work the same way - using their taxonomy term slugs
  const communitySubcategoryMap = {
    'pioneers': {
      data: window.FiltrationTaxonomies?.pioneerSubtypes || [],
      radioName: 'community-subcategory'
    },
    'education': {
      data: window.FiltrationTaxonomies?.educationSubtypes || [],
      radioName: 'community-subcategory'
    },
    'education-committee': {  // ADD THIS
      data: window.FiltrationTaxonomies?.educationSubtypes || [],
      radioName: 'community-subcategory'
    },
  
    // Add more community subcategory mappings as needed
  };

  const experienceSubcategoryMap = {
    'competition': {
      data: window.FiltrationTaxonomies?.competitionSubtypes || [],
      radioName: 'experience-subcategory'
    },
    'competitions': {  // Handle plural form
      data: window.FiltrationTaxonomies?.competitionSubtypes || [],
      radioName: 'experience-subcategory'
    },
    'emerging-technologies': {
      data: window.FiltrationTaxonomies?.etechSubtypes || [],
      radioName: 'experience-subcategory'
    },
    'etech': {  // Handle short form
      data: window.FiltrationTaxonomies?.etechSubtypes || [],
      radioName: 'experience-subcategory'
    },
    'games': {
      data: window.FiltrationTaxonomies?.gameSubtypes || [],
      radioName: 'experience-subcategory'
    },
    'history': {
      data: window.FiltrationTaxonomies?.historySubtypes || [],
      radioName: 'experience-subcategory'
    },
    'performances': {
      data: window.FiltrationTaxonomies?.performanceSubtypes || [],
      radioName: 'experience-subcategory'
    },
  };

  // Learning subcategory map
  const learningSubcategoryMap = {
    'art-papers': {
      data: window.FiltrationTaxonomies?.artPaperSubtypes || [],
      radioName: 'learning-subcategory'
    },
    'art-papers-and-presentations': {  // Handle full form (plural "papers")
      data: window.FiltrationTaxonomies?.artPaperSubtypes || [],
      radioName: 'learning-subcategory'
    },
    'frontiers': {
      data: window.FiltrationTaxonomies?.frontierSubtypes || [],
      radioName: 'learning-subcategory'
    }
  };

  
  // Get the appropriate data for this category
  // Both pioneers and education use their taxonomy term slugs directly (e.g., "pioneers", "education")
  const categoryKey = categorySlug.toLowerCase();
  
  // Check if this is a publication meta-category first
  let categoryInfo;
  if (categoryKey === 'publication-type-meta') {
    categoryInfo = {
      data: window.FiltrationTaxonomies?.publicationTypes || [],
      radioName: 'publication-type-subcategory'
    };
  } else if (categoryKey === 'publication-sub-type-meta') {
    categoryInfo = {
      data: window.FiltrationTaxonomies?.publicationSubTypes || [],
      radioName: 'publication-subtype-subcategory'
    };
  }
  // Check if this is an experience subcategory
  else {
    categoryInfo = experienceSubcategoryMap[categoryKey];
  }

  // If not experience subcategory, check learning subcategories
  if (!categoryInfo) {
    categoryInfo = learningSubcategoryMap[categoryKey];
  }
  
  // If not learning subcategory, check community subcategories
  if (!categoryInfo) {
    categoryInfo = communitySubcategoryMap[categoryKey];
  }
  // If not found, try to match by checking if the key contains 'education' or 'pioneer'
  // This handles any variations in the category value
  if (!categoryInfo) {
    if (categoryKey.includes('education')) {
      const educationData = window.FiltrationTaxonomies?.educationSubtypes || [];
      console.log('Education subtypes data:', educationData);
      categoryInfo = {
        data: educationData,
        radioName: 'community-subcategory'
      };
    } else if (categoryKey.includes('pioneer')) {
      const pioneerData = window.FiltrationTaxonomies?.pioneerSubtypes || [];
      console.log('Pioneer subtypes data:', pioneerData);
      categoryInfo = {
        data: pioneerData,
        radioName: 'community-subcategory'
      };
    }
  }
  
  // If still not a community subcategory, check the main category map
  if (!categoryInfo) {
    categoryInfo = categoryDataMap[categoryKey];
  }
  
  // Debug logging
  console.log('Category key:', categoryKey);
  console.log('Category info:', categoryInfo);
  console.log('Available taxonomies:', {
    educationSubtypes: window.FiltrationTaxonomies?.educationSubtypes,
    pioneerSubtypes: window.FiltrationTaxonomies?.pioneerSubtypes
  });

  

  
  if (!categoryInfo || !categoryInfo.data || categoryInfo.data.length === 0) {
    console.warn(`No type data found for category: ${categorySlug}`, {
      categoryKey,
      categoryInfo,
      hasEducationData: !!window.FiltrationTaxonomies?.educationSubtypes,
      hasPioneerData: !!window.FiltrationTaxonomies?.pioneerSubtypes,
      educationDataLength: window.FiltrationTaxonomies?.educationSubtypes?.length || 0,
      pioneerDataLength: window.FiltrationTaxonomies?.pioneerSubtypes?.length || 0
    });
    // Hide the Type facet if no data
    const categoryTypeElement = document.getElementById("category-type");
    if (categoryTypeElement) {
      categoryTypeElement.classList.remove('show');
    }
    return;
  }
  
  const radioName = categoryInfo.radioName;
  const radioIdPrefix = radioName.replace('-subcategory', '-subcat');
  
  // Add "View All Types" option first
  const allLabel = document.createElement('label');
  allLabel.className = 'sgg-radio';
  allLabel.innerHTML = `<input type="radio" name="${radioName}" id="${radioIdPrefix}-all" value="all" checked> View All Types`;
  facetBody.appendChild(allLabel);
  
  // Add each type option
  categoryInfo.data.forEach(term => {
    const label = document.createElement('label');
    label.className = 'sgg-radio';
    const id = `${radioIdPrefix}-${term.slug}`;
    label.innerHTML = `<input type="radio" name="${radioName}" id="${id}" value="${term.slug}"> ${term.name}`;
    facetBody.appendChild(label);
  });
  
  // Show the Type facet
  const categoryTypeElement = document.getElementById("category-type");
  if(categoryKey !== 'experience' && categoryKey !== 'learning' && categoryKey !== 'publications' && categoryKey !== 'awards' && categoryKey !== 'community'){
    if (categoryTypeElement) {
      categoryTypeElement.classList.add('show');
      categoryTypeElement.classList.remove('is-collapsed');
      
      // Make it collapsible (if not already set up)
      const title = categoryTypeElement.querySelector('.sgg-facet__title');
      if (title && !title.hasAttribute('tabindex')) {
        // Add caret if not present
        if (!title.querySelector('.sgg-caret')) {
          const caret = document.createElement('span');
          caret.className = 'sgg-caret';
          caret.textContent = '▾';
          title.appendChild(caret);
        }
        
        title.setAttribute('tabindex', '0');
        const toggle = () => categoryTypeElement.classList.toggle('is-collapsed');
        title.addEventListener('click', toggle);
        title.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        });
      }
    }
  } else{
    categoryTypeElement.classList.remove('show');
  }
  // Note: Event listener for subcategory changes is already set up in the main init block
  // (line ~946) using event delegation, so it will automatically handle these new radio buttons
  
  console.log(`Type facet populated with ${categoryInfo.data.length} options`);
}

// This is the universal function to show subcategories for any category (if no button then do nothing)
window.showSubcategories = function(categoryType) {
  console.log('showSubcategories called with type:', categoryType);
      // Debug: Show path detection (commented out)
    // const pathDebug = document.createElement('div');
    // pathDebug.id = 'path-debug';
    // pathDebug.style.cssText = 'position:fixed;top:50px;right:10px;background:#0f0;padding:10px;z-index:9998;border:2px solid #000;font-family:monospace;font-size:11px;';
    // pathDebug.innerHTML = `<strong>showSubcategories called with type:</strong><br>${categoryType}<br><br>`;
    // document.body.appendChild(pathDebug);

  // Map category types to their corresponding subcategory radio button names
  const categoryRadioMap = {
    'community': 'community-subcategory',
    'experience': 'experience-subcategory',
    'learning': 'learning-subcategory',
    'publications': 'publications-subcategory',
    'publication-type-meta': 'publication-type-subcategory',
    'publication-sub-type-meta': 'publication-subtype-subcategory',
    'awards': 'awards-subcategory'
  };
  
  // Get the radio button name for this category type
  const radioName = categoryRadioMap[categoryType.toLowerCase()];
  if (!radioName) {
    console.warn(`Unknown category type: ${categoryType}`);
    // const pathDebug = document.createElement('div');
    // pathDebug.id = 'path-debug';
    // pathDebug.style.cssText = 'position:fixed;top:50px;right:10px;background:#0f0;padding:10px;z-index:9998;border:2px solid #000;font-family:monospace;font-size:11px;';
    // pathDebug.innerHTML = `<strong>Unknown category type: ${categoryType}<br><br>`;
    // document.body.appendChild(pathDebug);
    return;
  }
  
  // Get the category-type element (already exists in template)
  const categoryTypeElement = document.getElementById("category-type");
  if (!categoryTypeElement) {
    console.warn('category-type element not found');
    
    return;
  }

  // Get the facet-type body element (already exists in template)
  const facetBody = document.getElementById("facet-type");
  if (!facetBody) {
    console.warn('facet-type body not found');
    return;
  }

  // Check if there are radio buttons for this specific category type
  const radioButtons = facetBody.querySelectorAll(`input[type=radio][name="${radioName}"]`);
  
  if (radioButtons.length === 0) {
    console.warn(`No radio buttons found for category type: ${categoryType} (name: ${radioName})`);
    // Don't show the facet if there are no radio buttons
    // const pathDebug = document.createElement('div');
    // pathDebug.id = 'path-debug';
    // pathDebug.style.cssText = 'position:fixed;top:50px;right:10px;background:#0f0;padding:10px;z-index:9998;border:2px solid #000;font-family:monospace;font-size:11px;';
    // pathDebug.innerHTML = `<strong>No radio buttons found for category type: ${categoryType} (name: ${radioName})<br><br>`;
    // document.body.appendChild(pathDebug);
    return;
  }
  
  console.log(`Found ${radioButtons.length} radio buttons, showing facet for ${categoryType}`);
  // const pathDebug = document.createElement('div');
  //   pathDebug.id = 'path-debug';
  //   pathDebug.style.cssText = 'position:fixed;top:50px;right:10px;background:#0f0;padding:10px;z-index:9998;border:2px solid #000;font-family:monospace;font-size:11px;';
  //   pathDebug.innerHTML = `<strong>Found ${radioButtons.length} radio buttons, showing facet for ${categoryType}<br><br>`;
  //   document.body.appendChild(pathDebug);

  // Show the category-type element by adding the 'show' class
  categoryTypeElement.classList.add('show');
  
  // Expand the Type dropdown (remove is-collapsed class if present)
  categoryTypeElement.classList.remove('is-collapsed');
  
  // Collapse the Category dropdown
  const categoryFacetBody = document.getElementById('facet-category');
  if (categoryFacetBody) {
    // Find the parent .sgg-facet element that contains the category facet body
    const categoryFacetParent = categoryFacetBody.closest('.sgg-facet');
    if (categoryFacetParent) {
      categoryFacetParent.classList.add('is-collapsed');
    }
  }
  
  // Make it collapsible (if not already set up)
  const title = categoryTypeElement.querySelector('.sgg-facet__title');
  if (title && !title.hasAttribute('tabindex')) {
    // Add caret if not present
    if (!title.querySelector('.sgg-caret')) {
      const caret = document.createElement('span');
      caret.className = 'sgg-caret';
      caret.textContent = '▾';
      title.appendChild(caret);
    }
    
    title.setAttribute('tabindex', '0');
    const toggle = () => categoryTypeElement.classList.toggle('is-collapsed');
    title.addEventListener('click', toggle);
    title.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  }
};

}

  function initSortSelect() {
    const sel = document.getElementById("sgg-sort-select");
    if (!sel) return;

    // Default to Year (Descending) matching backend tokens
    setSpan("sortby", "sortbyyear");
    setSpan("sortstyle", "descending");

    sel.addEventListener("change", () => {
      const v = sel.value;
      if (v.startsWith("title_")) {
        setSpan("sortby", "sortbytitle");
        setSpan("sortstyle", v.endsWith("asc") ? "ascending" : "descending");
      } else if (v.startsWith("year_")) {
        setSpan("sortby", "sortbyyear");
        setSpan("sortstyle", v.endsWith("asc") ? "ascending" : "descending");
      } else if (v.startsWith("author_")) {
        // Backend not wired yet; fall back to title sort for now
        setSpan("sortby", "sortbytitle");
        setSpan("sortstyle", v.endsWith("asc") ? "ascending" : "descending");
      }
      if (typeof window.getEntries === "function") {
        window.getEntries({ page: 1 });
      }
    });
  }

  function initSearch() {
    const input = document.getElementById("sgg-q");
    if (!input) return;
    
    const handler = debounce(() => {
      const searchTerm = (input.value || "").trim();
      setSpan("q", searchTerm);
      
      // Trigger server-side search by reloading entries from page 1
      if (typeof window.getEntries === "function") {
        window.getEntries({ page: 1 });
      }
    }, 350);
    
    input.addEventListener("input", handler);
  }
  
  /**
   * Filter the currently displayed entries by title (client-side search)
   * @param {string} searchTerm - The search term to filter by
   */
  function filterDisplayedEntries(searchTerm) {
    const container = document.getElementById("all-filtered-entries");
    if (!container) {
      console.error('Container #all-filtered-entries not found');
      return;
    }
    
    console.log('=== SEARCH DEBUG ===');
    console.log('Search term:', `"${searchTerm}"`);
    console.log('Container HTML:', container.innerHTML.substring(0, 200));
    
    // Get all entry card wrappers - these are the main containers for each entry
    let entries = container.querySelectorAll('.summary-card-wrapper');
    console.log('Found .summary-card-wrapper elements:', entries.length);
    
    // Fallback to other common entry selectors if summary-card-wrapper not found
    if (entries.length === 0) {
      entries = container.querySelectorAll('.pod-item, .sgg-card, tbody tr, .entry-item, .pods-item, article');
      console.log('Fallback: found other entry elements:', entries.length);
    }
    
    // Last resort: get all direct children of the container
    if (entries.length === 0) {
      entries = Array.from(container.children).filter(el => el.tagName !== 'STYLE' && el.tagName !== 'SCRIPT');
      console.log('Last resort: using direct children:', entries.length);
    }
    
    if (entries.length === 0) {
      console.warn('No entries found to filter');
      return;
    }
    
    let visibleCount = 0;
    
    entries.forEach((entry, index) => {
      // Skip header rows in tables
      if (entry.classList.contains('header-row') || 
          entry.querySelector('th') || 
          entry.parentElement?.tagName === 'THEAD') {
        return;
      }
      
      // For summary cards, look for the title link inside the summary-card div
      // Try multiple approaches to find the title
      let titleElement = entry.querySelector('.summary-card a strong');
      if (!titleElement) {
        titleElement = entry.querySelector('.summary-card strong a');
      }
      if (!titleElement) {
        titleElement = entry.querySelector('.summary-card a');
      }
      if (!titleElement) {
        titleElement = entry.querySelector('strong a');
      }
      if (!titleElement) {
        titleElement = entry.querySelector('a');
      }
      
      // Get title text - try different properties
      let searchableText = '';
      if (titleElement) {
        searchableText = titleElement.textContent || titleElement.innerText || titleElement.innerHTML || '';

        // Strip HTML tags if innerHTML was used
        searchableText = searchableText.replace(/<[^>]*>/g, '');
      }
      
      // If still empty, get ALL text from the entry (excluding breadcrumb nav)
      if (!searchableText.trim()) {
        const summaryCard = entry.querySelector('.summary-card');
        if (summaryCard) {
          searchableText = summaryCard.textContent || summaryCard.innerText || '';
        } else {
          searchableText = entry.textContent || entry.innerText || '';
        }
      }
      
      // Normalize: lowercase, trim, collapse whitespace
      searchableText = searchableText.toLowerCase().trim().replace(/\s+/g, ' ');
      
      // Debug first 3 entries
      if (index < 3) {
        console.log(`\nEntry ${index + 1}:`);
        console.log('  Element:', entry.className);
        console.log('  Title element:', titleElement ? titleElement.tagName : 'NOT FOUND');
        console.log('  Title element HTML:', titleElement ? titleElement.outerHTML.substring(0, 100) : 'N/A');
        console.log('  Title text:', searchableText.substring(0, 100));
        console.log('  Search term:', `"${searchTerm}"`);
        console.log('  Match:', searchableText.includes(searchTerm));
      }
      
      // Show/hide based on search match
      const matches = searchTerm === '' || searchableText.includes(searchTerm);
      
      if (matches) {
        entry.style.display = '';
        visibleCount++;
      } else {
        entry.style.display = 'none';
      }
    });
    
    console.log(`\nVisible: ${visibleCount} of ${entries.length} entries`);
    
    // Show "No matches" message if no entries are visible
    let noMatchMsg = container.querySelector('.no-match-message');
    
    if (visibleCount === 0 && searchTerm !== '') {
      if (!noMatchMsg) {
        noMatchMsg = document.createElement('div');
        noMatchMsg.className = 'no-match-message';
        noMatchMsg.style.cssText = 'padding: 3rem 2rem; text-align: center; color: #666; font-size: 1.2rem; background: #f9f9f9; border-radius: 8px; margin: 1rem 0; border: 1px dashed #ccc;';
        noMatchMsg.innerHTML = `
          <div><strong>No matches found</strong></div>
          <div style="color: #999; margin-top: 0.5rem; font-size: 1rem;">No results for "${searchTerm}"</div>
          <div style="color: #999; margin-top: 0.5rem; font-size: 0.9rem;">Try a different search term</div>
        `;
        container.appendChild(noMatchMsg);
      } else {
        noMatchMsg.innerHTML = `
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
          <div><strong>No matches found</strong></div>
          <div style="color: #999; margin-top: 0.5rem; font-size: 1rem;">No results for "${searchTerm}"</div>
          <div style="color: #999; margin-top: 0.5rem; font-size: 0.9rem;">Try a different search term</div>
        `;
        noMatchMsg.style.display = '';
      }
    } else {
      if (noMatchMsg) {
        noMatchMsg.style.display = 'none';
      }
    }
    
    // Update pagination visibility (hide it during search)
    const pagination = document.getElementById('entry-pagination');
    if (pagination) {
      pagination.style.display = searchTerm === '' ? '' : 'none';
    }
    
    console.log(`Search: "${searchTerm}" - ${visibleCount} of ${entries.length} entries visible`);
  }
  
  // Expose filterDisplayedEntries globally so it can be called from AJAX success handler
  window.filterDisplayedEntries = filterDisplayedEntries;

  function initViewToggle() {
    const buttons = document.querySelectorAll(".sgg-view-btn");
    if (!buttons.length) return;

    // Default view token for backend: galleryview
    setSpan("view", "galleryview");
    document.body.classList.remove("sgg-is-table"); // Gallery on first render
    updateHeaderVisibility(); // ensure headers hidden on first render

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => b.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        const viewToken = btn.dataset.view === "list" ? "tableview" : "galleryview";
        setSpan("view", viewToken);

        const isTable = btn.dataset.view === "list";
        document.getElementById("all-filtered-entries")
          ?.classList.toggle("sgg-list", isTable);
        document.querySelector(".sgg-results")
          ?.classList.toggle("sgg-list", isTable);

        // NEW: body class so CSS can target anywhere
        document.body.classList.toggle("sgg-is-table", isTable);

        updateHeaderVisibility(); // keep calling this here

        if (typeof window.getEntries === "function") {
          window.getEntries({ page: 1 });
        }
      });
    });
  }

  // Initialize on DOM ready
  $(function () {
    // Hide the old chunky header if still present
    $(".filter-buttons-main-container").hide();

    // Hide the weird table view headers
    updateHeaderVisibility();

	// Category radios
	initCategoryRadios("facet-category");
  
  


    // Year radios (single-select to stay compatible with backend today)
    // Render initial placeholders and then request server-driven year lists
    initYearRadios("facet-conf_year");
    initYearRadios("facet-conf_year_collectibles");

    // If a category is already selected on page load, ask server for matching years
    (function() {
      let initialCategory = 'viewall';
      const categoryFacet = document.getElementById('facet-category');
      if (categoryFacet) {
        const checked = categoryFacet.querySelector('input[type=radio]:checked');
        if (checked) initialCategory = checked.value === 'all' ? 'viewall' : checked.value;
      }
      // If a pod_name exists and no explicit category, use 'viewall' so server returns all years
      try { updateYearFacetForCategory(initialCategory); } catch(e) {}
    })();

    initSortSelect();
    initSearch();
    initViewToggle();

    // Ensure required spans exist (defensive)
    ["view", "sortby", "sortstyle", "year", "cat", "q"].forEach(id => {
      if (!document.getElementById(id)) {
        const s = document.createElement("span");
        s.id = id; s.style.display = "none";
        document.body.appendChild(s);
      }
    });
    // Ensure initial defaults are valid for backend
    if (!getSpan('year')) setSpan('year', 'viewall');
    if (!getSpan('cat')) setSpan('cat', 'viewall');
    
    // Set up event listener for subcategory radio buttons (populated in template)
    // Handles all category types: community, experience, learning, publications, awards
    const facetBody = document.getElementById("facet-type");
    if (facetBody) {
      // Use event delegation to handle radio button changes for all category types
      facetBody.addEventListener("change", (e) => {
        // Check if it's any subcategory radio button (community, experience, learning, publications, awards)
        if (e.target && e.target.matches("input[type=radio][name$='-subcategory']")) {
          const v = e.target.value;
          if (v === "all") {
            jQuery('#pod_sub_type_container').text("");
          } else {
            jQuery('#pod_sub_type_container').text(v);
          }
          if (typeof window.getEntries === "function") {
            window.getEntries({ page: 1 });
          }
        }
      });
    }
    
    // Check if we're on a community subcategory page and show subcategories
    // This handles the case where user navigates to a community subcategory page
    const path = window.location.pathname;
    const podName = jQuery('#pod_name_container').text().trim();
    
    // Check if we should show the Sub Type facet
    let shouldShowSubType = false;
    let categoryType = '';
    
    // Check for community subcategory pages
    if (path.startsWith('/community-')) {
      // For community pages, the category type is 'community'
      if (path.includes('/community-pioneers/') || 
          path.includes('/community-acm-siggraph-organization/') ||
          path.includes('/community-professional-and-student-chapters-committee/') ||
          path.includes('/community-digital-arts-community/') ||
          path.includes('/community-education-committee/') ||
          path.includes('/community-history-and-archives/')) {
        categoryType = 'community';
        shouldShowSubType = true;
      }
    }
    // Check for main category pages (Experience, Learning, Publications, Awards)
    else if (podName === 'experience' || podName === 'learning' || podName === 'publication' || podName === 'award') {
      // Map pod_name to category type for Type facet population
      let categoryForTypes = podName;
      if (podName === 'publication') {
        categoryType = 'publications';  // pod_name is 'publication' but category is 'publications'
        categoryForTypes = 'publications';
      } else if (podName === 'award') {
        categoryType = 'awards';  // pod_name is 'award' but category is 'awards'
        categoryForTypes = 'awards';
      } else {
        categoryType = podName;
        categoryForTypes = podName;
      }
      shouldShowSubType = true;
      
      // For main category pages, populate Type facet automatically on page load
      // Wait for taxonomies to be available
      const checkAndPopulate = () => {
        if (window.FiltrationTaxonomies && typeof populateTypeFacet === 'function') {
          console.log('Auto-populating Type facet for main category page:', categoryForTypes);
          populateTypeFacet(categoryForTypes, categoryType);
        } else if (window.FiltrationTaxonomies === undefined) {
          // Taxonomies not loaded yet, try again
          setTimeout(checkAndPopulate, 100);
        } else {
          console.warn('populateTypeFacet function not available or taxonomies not loaded');
        }
      };
      
      // Start checking after a short delay to ensure DOM is ready
      setTimeout(checkAndPopulate, 300);
    }
    
    // Get the category type from taxonomy if not already set
    if (!categoryType && window.FiltrationCurrentCategoryType) {
      categoryType = window.FiltrationCurrentCategoryType;
      shouldShowSubType = true;
    }

    // Show the Sub Type facet if we detected a category (for Community pages only)
    // Main category pages (Experience, Learning, Publications, Awards) are handled above
    if (shouldShowSubType && categoryType && categoryType === 'community' && typeof window.showSubcategories === 'function') {
      // Small delay to ensure DOM is fully ready
      setTimeout(() => {
        window.showSubcategories(categoryType);
      }, 100);
    }

    // Load entries on first render
    if (typeof window.getEntries === "function") {
      window.getEntries({ page: 1 });
    }
  });
})();

/* ============================================================
   SIGGRAPH – Collapsible facets + Year "show more"
   ============================================================ */
(function () {
  const $ = window.jQuery;

  /** Make every .sgg-facet collapsible (click title toggles body) */
function initCollapsibles() {
  document.querySelectorAll('[data-group]').forEach(group => {
    const facets = group.querySelectorAll('.sgg-facet');
    facets.forEach((facet, idx) => {
      const title = facet.querySelector('.sgg-facet__title');
      const body  = facet.querySelector('.sgg-facet__body');
      if (!title || !body) return;

      if (!title.querySelector('.sgg-caret')) {
        const caret = document.createElement('span');
        caret.className = 'sgg-caret';
        caret.textContent = '▾';
        title.appendChild(caret);
      }

      if (idx !== 0) facet.classList.add('is-collapsed'); // first stays open

      title.setAttribute('tabindex', '0');
      const toggle = () => facet.classList.toggle('is-collapsed');
      title.addEventListener('click', toggle);
      title.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  });
}

  /** Enhance Year radios to only show recent N by default, with "Show more" toggle */
  function clampYearFacet(containerId, visibleCount = 6) {
    const host = document.getElementById(containerId);
    if (!host) return;

    // collect all radios (skip "View All")
    const radios = Array.from(host.querySelectorAll('input[type="radio"]')).filter(r => r.value !== 'all');
    if (radios.length <= visibleCount) return; // nothing to clamp

    // hide older ones
    const toHide = radios.slice(visibleCount);
    toHide.forEach(r => {
      const label = r.closest('label') || r.parentElement;
      if (label) label.style.display = 'none';
    });

    // add "Show more / Collapse" link
    const more = document.createElement('div');
    more.className = 'sgg-facet__more';
    const hiddenCount = toHide.length;
    more.textContent = `Show ${hiddenCount} more years`;
    more.addEventListener('click', () => {
      const isHidden = toHide[0].closest('label').style.display === 'none';
      toHide.forEach(r => {
        const label = r.closest('label') || r.parentElement;
        if (label) label.style.display = isHidden ? '' : 'none';
      });
      more.textContent = isHidden ? 'Collapse years' : `Show ${hiddenCount} more years`;
    });
    host.appendChild(more);
  }

  // Expose clamp function so other modules can call it after dynamic re-renders
  try {
    window.clampYearFacet = clampYearFacet;
  } catch (e) {
    // ignore in environments without window
  }

  // Listen for programmatic updates to year facets and re-apply clamping
  try {
    document.addEventListener('year-facet-updated', function (ev) {
      const d = ev && ev.detail ? ev.detail : {};
      const cid = d.containerId || 'facet-conf_year';
      const vc = d.visibleCount || 6;
      try { clampYearFacet(cid, vc); } catch (e) { /* swallow */ }
    });
  } catch (e) {}

  // Run after our previous init block has rendered the facets
  $(function () {
    // Make facets collapsible
    initCollapsibles();

    // Clamp both year facets (whichever is visible on this page)
    clampYearFacet('facet-conf_year', 6);                 // Publications
    clampYearFacet('facet-conf_year_collectibles', 6);    // Collectibles
  });

  // Initialize Type facet on page load if needed
  jQuery(function() {
    const podName = jQuery('#pod_name_container').text().trim();
    const path = window.location.pathname;
    
    // Don't auto-populate for Community pages (they use navigation)
    if (!path.startsWith('/community-') && !path.startsWith('/community/')) {
      // Check if a specific category is already selected on page load
      const categoryFacet = document.getElementById('facet-category');
      if (categoryFacet) {
        const checkedRadio = categoryFacet.querySelector('input[type=radio]:checked');
        if (checkedRadio && checkedRadio.value !== 'all') {
          const categoryValue = checkedRadio.value;
          const categoryName = checkedRadio.parentElement.textContent.trim();
          
          // Map pod_name to category for Type facet population
          let categoryForTypes = categoryValue;
          if (podName === 'publication') categoryForTypes = 'publications';
          if (podName === 'award') categoryForTypes = 'awards';
          
          populateTypeFacet(categoryForTypes, categoryName);
        }
      }
    }
  });
})();

// Hide ALL legacy header rows inside #tableContainerScroll (no flash; safe for Gallery)
function toggleLegacyHeaderBlocks(isTable) {
  // Always hide the really old header wrappers
  ['#tableHeadersParent', '#tableHeaders'].forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  });

  showRelevantTableHeader(isTable);
}

// Ensure only the relevant table header is visible per page/pod
function showRelevantTableHeader(isTable) {
  const container = document.getElementById('tableContainerScroll');
  if (!container) return;

  // Hide all header strips first
  container.querySelectorAll('[id^="table"]').forEach(el => {
    el.style.setProperty('display', 'none', 'important');
  });
  if (!isTable) return;

  const podName = (document.getElementById('pod_name_container')?.textContent || '').trim();
  const desc = (document.getElementById('description')?.textContent || '').trim();

  const byPod = {
    learning: 'tableLearning',
    experience: 'tableExperience',
    publication: 'tablePublication',
    award: 'tableAward',
    artwork: 'tableArtwork',
    community: 'tableCommunity',
    community_overview: 'tableCommunity',
  };

  let headerId = byPod[podName];
  if (!headerId) {
    if (desc.includes('Learning')) headerId = 'tableLearning';
    else if (desc.includes('Experience')) headerId = 'tableExperience';
    else if (desc.includes('Publication')) headerId = 'tablePublication';
    else if (desc.includes('Award')) headerId = 'tableAward';
  }

  if (headerId) {
    const el = document.getElementById(headerId);
    if (el) el.style.setProperty('display', 'flex', 'important');
  }
}

function updateHeaderVisibility() {
  const entries = document.getElementById('all-filtered-entries');
  const results = document.querySelector('.sgg-results');

  const isTable =
    (entries && entries.classList.contains('sgg-list')) ||
    (results && results.classList.contains('sgg-list')) ||
    document.body.classList.contains('sgg-is-table');

  // Real thead (if any)
  document.querySelectorAll('#all-filtered-entries thead, .sgg-results thead')
    .forEach(th => th.style.setProperty('display', isTable ? '' : 'none', 'important'));

  // Common “fake header is first tbody row”
  document.querySelectorAll('#all-filtered-entries tbody > tr:first-child, .sgg-results tbody > tr:first-child')
    .forEach(tr => tr.style.setProperty('display', isTable ? '' : 'none', 'important'));

  // Div-based header strip (wherever it is)
  toggleLegacyHeaderBlocks(isTable);
}


(function observeResultsForHeader() {
  const root =
    document.getElementById('all-filtered-entries') ||
    document.querySelector('.sgg-results') ||
    document.body;
  if (!window.MutationObserver || !root) return;

  const obs = new MutationObserver(() => {
    // wait a tick for DOM to settle, then enforce
    requestAnimationFrame(updateHeaderVisibility);
  });
  obs.observe(root, { childList: true, subtree: true });
})();

/* ============================================================
   Mobile filters drawer: toggle button + open/close behavior
   ============================================================ */
(function () {
  function ensureFiltersToggle() {
    if (document.getElementById('sgg-filters-toggle')) return;

    // Prefer to place the button in the toolbar; fall back to results header.
    const toolbar = document.querySelector('.sgg-toolbar') || document.querySelector('.sgg-results');
    if (!toolbar) return;

    const btn = document.createElement('button');
    btn.id = 'sgg-filters-toggle';
    btn.className = 'sgg-filters-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'sgg-facets');
    btn.textContent = 'Show Filters';

    // put it at the start of the toolbar
    toolbar.prepend(btn);

    // Helper function to check if we're on mobile
    const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

    // Helper function to update button text
    const updateButtonText = () => {
      if (isMobile()) {
        const isOpen = document.body.classList.contains('filters-open');
        btn.textContent = isOpen ? 'Hide Filters' : 'Show Filters';
      } else {
        const isCollapsed = document.body.classList.contains('sgg-filters-collapsed');
        btn.textContent = isCollapsed ? 'Show Filters' : 'Hide Filters';
      }
    };


    // add a close button inside the drawer (first time only)
    const aside = document.getElementById('sgg-facets');
    if (aside && !aside.querySelector('.sgg-filters-close')) {
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'sgg-filters-close';
      close.textContent = 'Hide Filters';
      close.addEventListener('click', () => {
        if (isMobile()) {
          document.body.classList.remove('filters-open');
        } else {
          document.body.classList.remove('sgg-filters-collapsed');
        }
        btn.setAttribute('aria-expanded', 'false');
        updateButtonText();
      });
      aside.prepend(close);
    }

    // open/close toggle
    btn.addEventListener('click', () => {
      if (isMobile()) {
        const open = document.body.classList.toggle('filters-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      } else {
        const collapsed = document.body.classList.toggle('sgg-filters-collapsed');
        btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      }
      updateButtonText();
    });

    // click outside to close (mobile only)
    document.addEventListener('click', (e) => {
      if (!isMobile()) return;
      if (!document.body.classList.contains('filters-open')) return;
      const aside = document.getElementById('sgg-facets');
      if (aside && !aside.contains(e.target) && !btn.contains(e.target)) {
        document.body.classList.remove('filters-open');
        btn.setAttribute('aria-expanded', 'false');
        updateButtonText();
      }
    });

    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (isMobile() && document.body.classList.contains('filters-open')) {
          document.body.classList.remove('filters-open');
          btn.setAttribute('aria-expanded', 'false');
          updateButtonText();
        } else if (!isMobile() && !document.body.classList.contains('sgg-filters-collapsed')) {
          document.body.classList.add('sgg-filters-collapsed');
          btn.setAttribute('aria-expanded', 'false');
          updateButtonText();
        }
      }
    });

    // Update button text on window resize
    window.addEventListener('resize', updateButtonText);
    
    // Initial button text
    updateButtonText();
  }

  // run after DOM ready (works with existing init flow)
  if (window.jQuery) {
    jQuery(ensureFiltersToggle);
  } else {
    document.addEventListener('DOMContentLoaded', ensureFiltersToggle);
  }
})();
