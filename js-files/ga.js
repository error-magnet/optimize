this.onmessage = function(){
	self.optimize();
};

this.obj = function(bin){
	var x = self.decode(self.constraints[0], bin.substring(0, self.bits-1));
	var y = self.decode(self.constraints[1], bin.substring(self.bits, self.bits*2));
	//objective function
	return 25*Math.pow(Math.sin(x), 2)+ Math.pow(Math.sin(y), 2)+ x*x + y*y;
};

this.fitness = function(bin){
	var x = self.decode(self.constraints[0], bin.substring(0, self.bits-1));
	var y = self.decode(self.constraints[1], bin.substring(self.bits, self.bits*2));
	//objective function
	var obj = 25*Math.pow(Math.sin(x), 2)+ Math.pow(Math.sin(y), 2)+ x*x + y*y;
	//objective is to minimize. 1/obj will lead to singularties when obj = 0, so add one
	//TODO: just do negative?
	return 1/(1+obj);
};

this.optimize = function(){
	
	//set constraints
	self.constraints = [];
	self.constraints[0] = [-8, 8];
	self.constraints[1] = [-8, 8];
	
	//set number of variables
	self.nVars = 2;
	
	//mutation probability
	self.pMutation = 0.05;
	//cross over probability
	self.pCross = 0.75;
	
	//number of bits in each value
	//for binary encoding
	self.bits = 20;
	
	//number of chromosomes
	self.nChromos = 20;
	
	//populate initial parent
	var parent = self.initialize();
	var fitness = [], children = [], bestParent, worstParent, bestValuesArray = [];
	
	//generation counter
	var gen = 0;
	
	//while exit criteria is satisfied
	//TODO
	while(gen < 10){
	
		//calculate fitness function based on the objective function
		//fitness: higher is better
		parent.forEach(function(e, i){
			fitness[i] = self.fitness(e); 
		});
		
		//find position of min index and max index
		var minIndex, maxIndex;
		var minValue = Infinity, maxValue = -Infinity;
		
		fitness.forEach(function(val, i){
			if(minValue > val) {
				minValue = val;
				minIndex = i;
			}
			if(maxValue < val) {
				maxValue = val;
				maxIndex = i;
			}
		});
		
		bestValuesArray.push(self.obj(parent[maxIndex]));
		
		//make sure the best gene stays
		//replace the worst value with the best value of the parent
		if(gen !== 0){
			parent[minIndex] = bestParent;
			fitness[minIndex] = self.fitness(bestParent);
		}
		
		//store the new best parent
		bestParent = parent[maxIndex];
		
		
		
		
		
		//make roulette wheel selection to populate mating pool
		//make a pie with designs getting slices with size based on their fitness
		//roll a value and select the value where it lands
		
		var fitnessSum = 0;
		for(var i=0; i<nChromos; i++) fitnessSum += fitness[i];
		
		
		var pStack = [], lastStack = 0;
		for(var i=0; i<self.nChromos; i++){
			pStack[i] = lastStack + fitness[i]/fitnessSum;
			lastStack = pStack[i];
		};
		
		//populate mating pool
		var matingPool = [], randomVals = [];
		for(var i=0; i<self.nChromos; i++){
			randomVals.push(Math.random());
		}
		
		//check which slice of the pie random value lies and push it to the mating pool
		var selectedVal;
		for(var i=0; i<self.nChromos; i++){
			for(var j=0; j<self.nChromos; j++){
				if(randomVals[i] > pStack[j]){
					selectedVal = parent[i];
					break;
				}
			}
			matingPool.push(selectedVal);
		}
		
		//mating
		//some chromosomes need to be crossed over, some not
		var crossPool = [], noCrossPool = [];
		for(var i=0; i<self.nChromos; i++){
			if(Math.random() < pCross) 
				crossPool.push(matingPool[i]);
			else 
				noCrossPool.push(matingPool[i]);
		}
		
		//make sure number of terms being crossed is even
		//currently removing the last point from cross and putting it into no cross
		// or vice versa randomly
		if(crossPool.length % 2 !== 0){
			if(Math.round(Math.random())){
				//move from cross to no cross
				noCrossPool.push(crossPool[crossPool.length-1]);
				crossPool.splice(crossPool.length-1);
			}
			else{
				//move from cross to no cross
				crossPool.push(noCrossPool[noCrossPool.length-1]);
				noCrossPool.splice(noCrossPool.length-1);
			}
		}
		
		//cross the terms!
		//ab, cd = ad, bc. randomly selected crossPoint is the pivot
		var thisTerm, crossPoint;
		for(var i=0; i<crossPool.length; i+=2){
			children[i] = '', children[i+1] = '';
			crossPoint = Math.round(self.nVars * self.bits * Math.random());
			
			children[i] += crossPool[i].substring(0, crossPoint-1) + 
				crossPool[i+1].substring(crossPoint, self.nVars*self.bits);
			children[i+1] = crossPool[i+1].substring(0, crossPoint-1) + 
				crossPool[i].substring(crossPoint, self.nVars*self.bits);
		}
		
		children = children.concat(noCrossPool);
		
		//mutation
		//mutatate a bit based on mutation probability
		
		for(var i=0; i<self.nChromos; i++){
			for(var j=0; j<self.nVars*self.bits; j++){
				if(Math.random() < pMutation){
					children[i][j] = children[i][j] === '0' ? '1' : '0';
				}
			}
		}
		
		parent = children.slice();
		gen++;
	}
	
	
	 
	self.postMessage(bestValuesArray);
};

//Initializes and returns an array of chromosomes for generation zero
this.initialize = function(){
	var init = [];
	for(var i=0; i < self.nChromos; i++){
		init[i] = '';
		for(var j=0; j<self.bits*self.nVars; j++){
			init[i] += Math.round(Math.random());
		}
	}
	return init;
};

this.decode = function(constraint, value){
	return parseInt(value, 2)*(constraint[1]-constraint[0]/(2^(self.bits))) + constraint[0];
};


