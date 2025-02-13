/*******************************************************************************
 * Copyright (c) 2013 Max Schaefer
 * Copyright (c) 2018 Persper Foundation
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *******************************************************************************/

/* Module for adding standard library/DOM modelling to flow graph. */

    var flowgraph = require('./flowgraph'),
        nativeFlows = require('./harness').nativeFlows;

    function addNativeFlowEdges(flow_graph) {
        for (var native in nativeFlows) {
            if (!nativeFlows.hasOwnProperty(native))
                continue;
            var target = nativeFlows[native];
            flow_graph.addEdge(
                flowgraph.nativeVertex(native),
                flowgraph.propVertex({
                    type: 'Identifier',
                    name: target
                })
            );
        }
        return flow_graph;
    }

    exports.addNativeFlowEdges = addNativeFlowEdges;
