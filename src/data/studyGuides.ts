import { StudyGuide } from '../types/teas';

export const STUDY_GUIDES: StudyGuide[] = [
  {
    id: 'guide-ap-high-yield',
    title: 'ATI TEAS 7 High-Yield Anatomy & Physiology Master Sheet',
    subject: 'science',
    readTime: '12 min read',
    pagesCount: 6,
    summary: 'The essential systems, cell structures, hormones, and physiological feedback loops most frequently tested on the ATI TEAS 7 Science subtest.',
    sections: [
      {
        title: '1. Cardiovascular & Hemodynamic Circuits',
        content: [
          'The human cardiovascular system is a double-loop closed circuit: Pulmonary loop and Systemic loop.',
          'Pulmonary Circulation: Deoxygenated blood from Superior/Inferior Vena Cava ➔ Right Atrium ➔ Tricuspid Valve ➔ Right Ventricle ➔ Pulmonary Valve ➔ Pulmonary Trunk/Arteries ➔ Lungs (oxygenated).',
          'Systemic Circulation: Oxygenated blood from Pulmonary Veins ➔ Left Atrium ➔ Bicuspid (Mitral) Valve ➔ Left Ventricle ➔ Aortic Valve ➔ Aorta ➔ Systemic Organs.',
          'Cardiac Pacemaker Hierarchy: Sinoatrial (SA) node fires first at 60–100 bpm ➔ Atrioventricular (AV) node (40–60 bpm) ➔ Bundle of His ➔ Bundle Branches ➔ Purkinje fibers (20–40 bpm).',
          'Blood Pressure Components: Systolic pressure (ventricular contraction, peak pressure) / Diastolic pressure (ventricular relaxation, minimum pressure). Normal < 120/80 mmHg.',
        ],
        table: {
          headers: ['Heart Valve', 'Location', 'Heart Sound Associated', 'Function'],
          rows: [
            ['Tricuspid', 'Between Right Atrium & Right Ventricle', 'S1 ("Lub")', 'Prevents backflow into right atrium during systole'],
            ['Mitral (Bicuspid)', 'Between Left Atrium & Left Ventricle', 'S1 ("Lub")', 'Prevents backflow into left atrium during systole'],
            ['Pulmonic Semilunar', 'Between Right Ventricle & Pulmonary Trunk', 'S2 ("Dub")', 'Prevents backflow into right ventricle during diastole'],
            ['Aortic Semilunar', 'Between Left Ventricle & Aorta', 'S2 ("Dub")', 'Prevents backflow into left ventricle during diastole'],
          ],
        },
        keyTakeaways: [
          'Veins carry blood toward the heart (usually deoxygenated, except pulmonary veins).',
          'Arteries carry blood away from the heart (usually oxygenated, except pulmonary arteries).',
          'Left ventricle has the thickest muscular myocardium to generate systemic perfusion pressure.',
        ],
      },
      {
        title: '2. Endocrine Master Regulators & Hormone Functions',
        content: [
          'Hypothalamus produces ADH (Vasopressin) and Oxytocin, stored and released by the POSTERIOR PITUITARY.',
          'Anterior Pituitary produces FLAT PIG hormones: FSH, LH, ACTH, TSH, Prolactin, (I - ignore), GH (Growth Hormone).',
          'Adrenal Glands: Medulla secretes Epinephrine & Norepinephrine (sympathetic response). Cortex secretes Cortisol (glucocorticoid), Aldosterone (mineralocorticoid), and Androgens.',
          'Endocrine Pancreas: Alpha cells produce Glucagon (elevates glucose via glycogenolysis); Beta cells produce Insulin (lowers glucose via cellular uptake and glycogenesis).',
        ],
        table: {
          headers: ['Hormone', 'Gland / Origin', 'Target Tissue', 'Primary Action'],
          rows: [
            ['Insulin', 'Pancreatic Beta Cells', 'Liver, Skeletal Muscle, Adipose', 'Lowers blood glucose, stimulates glycogenesis'],
            ['Glucagon', 'Pancreatic Alpha Cells', 'Liver', 'Raises blood glucose, stimulates glycogenolysis'],
            ['Parathyroid Hormone (PTH)', 'Parathyroid Glands', 'Bone, Kidneys, Gut', 'Increases blood Ca²⁺ (activates osteoclasts)'],
            ['Calcitonin', 'Thyroid Parafollicular Cells', 'Bone', 'Decreases blood Ca²⁺ (inhibits osteoclasts)'],
            ['Aldosterone', 'Adrenal Cortex', 'Distal Nephron / Collecting Duct', 'Retains Na⁺ and water, excretes K⁺ to increase BP'],
            ['Antidiuretic Hormone (ADH)', 'Hypothalamus (post. pituitary)', 'Kidney Collecting Ducts', 'Increases water reabsorption (concentrates urine)'],
          ],
        },
      },
      {
        title: '3. Renal Anatomy & Urine Formation',
        content: [
          'Three Steps of Urine Formation: Glomerular Filtration ➔ Tubular Reabsorption ➔ Tubular Secretion.',
          'Glomerular Filtration: Passive filtration driven by hydrostatic pressure. Blood cells and large plasma proteins (albumin) are normally excluded.',
          'Proximal Convoluted Tubule (PCT): Reabsorbs ~65% of water, 100% of glucose and amino acids under normal conditions.',
          'Loop of Henle: Descending limb is permeable to water (not solute); Ascending limb actively pumps out Na⁺/K⁺/2Cl⁻ (impermeable to water). Establishes hyperosmotic medullary gradient.',
          'Distal Tubule & Collecting Duct: Fine-tuned by Aldosterone (Na⁺ in, K⁺ out) and ADH (aquaporin channel insertion for water reabsorption).',
        ],
      },
    ],
  },
  {
    id: 'guide-math-formulas',
    title: 'TEAS 7 Mathematics Quick Formulas & Dosage Conversions',
    subject: 'math',
    readTime: '9 min read',
    pagesCount: 4,
    summary: 'Clinical dose formulas, metric conversions, geometric formulas, and percentage shortcuts for the TEAS Math section.',
    sections: [
      {
        title: '1. Metric & Household Unit Conversions (Must Memorize)',
        content: [
          'Dosage calculations on the TEAS require seamless conversions between household, apothecary, and metric units.',
        ],
        table: {
          headers: ['Metric Unit', 'Equivalent Metric / Household', 'Clinical Rule of Thumb'],
          rows: [
            ['1 kilogram (kg)', '2.2046 pounds (lb)', 'Divide pounds by 2.2 for weight in kg'],
            ['1 gram (g)', '1,000 milligrams (mg)', 'Move decimal 3 places right'],
            ['1 milligram (mg)', '1,000 micrograms (mcg)', 'Move decimal 3 places right'],
            ['1 liter (L)', '1,000 milliliters (mL)', '1 mL = 1 cubic centimeter (cc)'],
            ['1 teaspoon (tsp)', '5 milliliters (mL)', '1 standard household measuring spoon'],
            ['1 tablespoon (tbsp)', '15 mL (3 tsp)', '3 teaspoons in 1 tablespoon'],
            ['1 fluid ounce (fl oz)', '30 mL (2 tbsp)', 'Standard medication cup volume = 30 mL'],
            ['1 cup', '8 fl oz = 240 mL', 'Inpatient intake calculation baseline'],
          ],
        },
      },
      {
        title: '2. Nursing Dose Calculation Formulas',
        content: [
          'Universal Formula (Desired over Have): Dose to Give = (Desired Dose / Have on Hand) × Quantity/Volume.',
          'Example: Order is 500 mg. Stock bottle contains 250 mg / 5 mL. Dose = (500 / 250) × 5 mL = 2 × 5 mL = 10 mL.',
          'Weight-Based Dosing: (mg/kg/day) ➔ Multiply patient weight in kg by prescribed mg/kg, then divide by number of divided doses per day.',
        ],
      },
      {
        title: '3. Geometry & Coordinate Formulas',
        content: [
          'Perimeter of Rectangle: P = 2l + 2w',
          'Area of Rectangle: A = l × w',
          'Circumference of Circle: C = 2πr = πd (Use π ≈ 3.14)',
          'Area of Circle: A = πr²',
          'Area of Triangle: A = 1/2 × base × height',
          'Volume of Rectangular Prism: V = l × w × h',
          'Volume of Cylinder: V = πr²h',
          'Pythagorean Theorem: a² + b² = c² (Right triangles)',
        ],
      },
    ],
  },
  {
    id: 'guide-medical-terminology',
    title: 'Medical Terminology & Linguistic Roots Cheat Sheet',
    subject: 'english',
    readTime: '8 min read',
    pagesCount: 5,
    summary: 'High-frequency Greek and Latin prefixes, roots, and suffixes essential for both the English and Science sections.',
    sections: [
      {
        title: '1. Common Organ & Anatomical Roots',
        content: [
          'Knowing core prefixes and roots allows you to deduce the definition of unfamiliar anatomical conditions.',
        ],
        table: {
          headers: ['Root / Combining Form', 'Meaning', 'Example Condition / Procedure'],
          rows: [
            ['Cardio-', 'Heart', 'Cardiomyopathy (disease of heart muscle)'],
            ['Nephro- / Reno-', 'Kidney', 'Nephrolithiasis (kidney stones)'],
            ['Hepato-', 'Liver', 'Hepatomegaly (enlargement of the liver)'],
            ['Pneumo- / Pulmo-', 'Lungs / Air', 'Pneumothorax (air in pleural space)'],
            ['Encephalo-', 'Brain', 'Encephalitis (inflammation of brain tissue)'],
            ['Gastro-', 'Stomach', 'Gastritis (inflammation of stomach lining)'],
            ['Osteo-', 'Bone', 'Osteoarthritis (inflammation of bone joints)'],
            ['Chondro-', 'Cartilage', 'Chondrosarcoma (malignancy of cartilage)'],
          ],
        },
      },
      {
        title: '2. Clinical Suffixes & Surgical Terms',
        content: [
          '-itis: Inflammation (e.g., pancreatitis)',
          '-ectomy: Surgical removal / excision (e.g., cholecystectomy)',
          '-ostomy: Surgical creation of a permanent or semi-permanent stoma/opening (e.g., tracheostomy)',
          '-otomy: Surgical incision into an organ (e.g., laparotomy)',
          '-plasty: Surgical repair or reconstruction (e.g., rhinoplasty)',
          '-algia: Pain (e.g., myalgia = muscle pain)',
          '-emia: Blood condition (e.g., hypoxemia = low oxygen in blood)',
          '-pnea: Breathing (e.g., tachypnea = rapid breathing > 20 bpm)',
        ],
      },
    ],
  },
];
