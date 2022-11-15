import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase.config";
import { FiPrinter } from "react-icons/fi";
import { FaLink } from "react-icons/fa";


import Spinner from "../components/Spinner";

const RecipeViewer = () => {
  const [recipe, setRecipe] = useState(null);
  const [steps, setSteps] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    const fetchRecipe = async () => {
      const docRef = doc(db, "recipes", params.recipeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setRecipe({ ...docSnap.data(), id: params.recipeId });
        setLoading(false);
      }

      let newSteps = [];
      let sCount = 1;
      docSnap.data().instructions.forEach((item, index) => {
        if (/^##/.test(item)) {
          newSteps.push(
            <h3
              key={`ingredient-${index}`}
              className="flex flex-row mb-4 gap-4 font-semibold"
            >
              {item.replace(/^#*/, "")}
            </h3>
          );
        } else {
          newSteps.push(
            <li key={`step-${index}`} className="flex flex-row mb-4 gap-4">
              <div>
                <p className="bg-primary text-primary-content rounded-full w-6 h-6 text-center">
                  {sCount}
                </p>
              </div>
              <p>{item}</p>
            </li>
          );
          sCount += 1;
        }
      });
      setSteps([...newSteps]);
    };
    fetchRecipe();
  }, [navigate, params.recipeId]);

  if (loading) {
    return <Spinner />;
  }

  const ingredients = recipe.ingredients.map((item, index) => {
    if (/^##/.test(item)) {
      return (
        <h3
          key={`ingredient-${index}`}
          className="flex flex-row mb-2 gap-4 font-semibold mt-4 first:mt-0"
        >
          {item.replace(/^#*/, "")}
        </h3>
      );
    }
    return (
      <li key={`ingredient-${index}`} className="form-control">
        <label className="label cursor-pointer mb-0 gap-4 justify-start">
          <input type="checkbox" className="checkbox checkbox-primary" />
          <p className="checkbox-label-strikethrough">{item}</p>
        </label>
      </li>
    );
  });

  return (
    <div className="w-100 flex flex-row justify-center mb-12">
      <div className="flex flex-col w-[90%] sm:w-[70%] max-w-[1000px]">
        <h1 className="text-xl lg:text-5xl font-bold lg:font-medium font-title mb-4">
          {recipe.name}
        </h1>
        <div className="flex flex-row gap-1 mb-4">
          <p className="font-content">by</p>
          <a href={recipe.sourceUrl} target="_blank" rel="noreferrer">
            <p className="font-content underline">{recipe.sourceName}</p>
          </a>
          <FaLink className="text-xs self-center"/>
          <p className="font-content">
             - Added {new Date(recipe.timestamp.seconds * 1000).toDateString()}
          </p>
        </div>
        <p className="font-content text-sm lg:text-base border-t pt-4 mb-4 empty:border-none empty:mb-2 empty:p-0">
          {recipe.description}
        </p>
        <div
          className="w-full aspect-[5/3] bg-cover bg-center rounded-xl"
          style={{ backgroundImage: `url(${recipe.img})` }}
        ></div>

        <div className="flex flex-row gap-4 mt-6 lg:mt-8 px-2 items-center">
          <div className="flex flex-col font-content border-r pr-4 last:border-none last:pr-0">
            <p className="text-xs text-gray-500">PREP TIME</p>
            <p className="uppercase">{recipe.preparation}</p>
          </div>
          <div className="flex flex-col font-content border-r pr-4 last:border-none last:pr-0">
            <p className="text-xs text-gray-500">COOK TIME</p>
            <p className="uppercase">{recipe.cooking}</p>
          </div>
          <div className="flex flex-col font-content border-r pr-4 last:border-none last:pr-0">
            <p className="text-xs text-gray-500">SERVINGS</p>
            <p className="uppercase">{recipe.servings}</p>
          </div>
          <button className="btn btn-ghost">
            <FiPrinter className="text-xl" />
          </button>
        </div>

        {/* todo: add a way to detect subsections and display them properly */}

        <h2 className="font-title text-xl font-semibold my-6">Ingredients</h2>
        <div className="font-content">
          <ul>
            {ingredients}
          </ul>
        </div>

        <h2 className="font-title text-xl font-semibold my-6">Instructions</h2>
        <div className="font-content">
          <ul>{steps}</ul>
        </div>
      </div>
    </div>
  );
};

export default RecipeViewer;
