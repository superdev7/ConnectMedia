<ul class="pagination" ng-if="1 < pages.length || !autoHide">
    <li ng-if="boundaryLinks" ng-class="{ disabled : pagination.current == 1 }">
        <a ng-click="setCurrent(1)">&laquo;</a>
    </li>
    <li ng-if="directionLinks" ng-class="{ disabled : pagination.current == 1 }">
        <a ng-click="setCurrent(pagination.current - 1)">&lsaquo;</a>
    </li>
    <li ng-repeat="pageNumber in pages track by tracker(pageNumber, $index)" ng-class="{ active : pagination.current == pageNumber, disabled : pageNumber == '...' }">
        <a ng-click="setCurrent(pageNumber)">@{{ pageNumber }}</a>
    </li>

    <li ng-if="directionLinks" ng-class="{ disabled : pagination.current == pagination.last }">
        <a ng-click="setCurrent(pagination.current + 1)">&rsaquo;</a>
    </li>
    <li ng-if="boundaryLinks"  ng-class="{ disabled : pagination.current == pagination.last }">
        <a ng-click="setCurrent(pagination.last)">&raquo;</a>
    </li>
</ul>